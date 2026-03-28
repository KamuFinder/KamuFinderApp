import React, { use, useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, Alert,  } from "react-native";
import { useUser } from "../context/UserContext.js";
import { firestore, USERS, FRIENDREQUESTS, doc, getDoc, onSnapshot, setDoc} from "../firebase/config";
import { collection, deleteDoc, serverTimestamp, writeBatch, updateDoc, query, where, getDocs } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import styles from "../styles/Notifications.js";

export default function Notifications() {
  const user = useUser();
  const [friendRequests, setFriendRequests] = useState([]);
  const [ sentFriendRequests, setSentFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigation = useNavigation();
  
  // Use refs to track latest state without changing listener
  const friendRequestsRef = useRef([]);
  const notificationsRef = useRef([]);
  const listenerSetupRef = useRef(false);

  const newFriendRequests = friendRequests.filter(r => !r.read && r.status !== "declined");
  const readFriendRequests = friendRequests.filter((r) => r.read && r.status !== "declined");
  const newNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  // Update refs whenever state changes
  friendRequestsRef.current = friendRequests;
  notificationsRef.current = notifications;


  // Fetch friend requests
  useEffect(() => {
    if (!user) return;

    const friendRequestsRef = collection(firestore, USERS, user.uid, FRIENDREQUESTS)
    const unsubscribe = onSnapshot(friendRequestsRef, async (querySnapshot) => {

      const incomming = []
      const outgoing = []

      for ( const docSnap of querySnapshot.docs) {
        const data = docSnap.data()
        let name = "Poistettu käyttäjä";
        let Date = data.timestamp?.toDate?.() || null;
        let isDeletedUser = false;

        if (data.toUserId === user.uid) {
          const fromUserSnap = await getDoc(doc(firestore, USERS, data.fromUserId))
          if (fromUserSnap.exists()) {
            const fromData = fromUserSnap.data()
            name = `${fromData.firstName} ${fromData.lastName}` || "Tuntematon"
          }
          else {
            isDeletedUser = true
          }
          incomming.push({ id: docSnap.id, name, Date, isDeletedUser, ...data })

        } else if (data.fromUserId === user.uid) {
          const toUserSnap = await getDoc(doc(firestore, USERS, data.toUserId))
          if (toUserSnap.exists()) {
            const toData = toUserSnap.data()
            name = `${toData.firstName} ${toData.lastName}` || "Tuntematon"
          }
          else {
            isDeletedUser = true
          }
          outgoing.push({ id: docSnap.id, name, Date, isDeletedUser, ...data })
        }
      }
      setFriendRequests(incomming)
      setSentFriendRequests(outgoing)
  })

    return () => unsubscribe(); 
  }, [user]);


  // Listen for notifications
  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(firestore, USERS, user.uid, "notifications")
    const unsubscribe = onSnapshot(notificationsRef, (querySnapshot) => {
      const notifications = []
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() })
      });
      setNotifications(notifications)
    });

    return () => unsubscribe();
  }, [user]);


  // Mark items as read when leaving the screen (blur event)
  useEffect(() => {
    if (listenerSetupRef.current) {
      return;
    }
    
    listenerSetupRef.current = true

    const unsubscribeBlur = navigation.addListener('blur', async () => {
      try {
        await markFriendRequestsReadData(friendRequestsRef.current)
      } catch (error) {
        console.error('Error marking friend requests as read:', error)
      }
      
      try {
        await markNotificationsReadData(notificationsRef.current)
      } catch (error) {
        console.error('Error marking notifications as read:', error)
      }
    });

    const unsubscribeFocus = navigation.addListener('focus', () => {
      // Screen is now focused
      // Just here for if needed in the future, currently no action on focus
    });

    return () => {
      // Keep listeners alive throughout the session
    };
  }, [navigation]); 


  
  //User accepting friend request
  const handleAccept = async (req) => {
    try {
      const currentUserRef = doc(firestore, USERS, user.uid)
      const otherUserRef = doc(firestore, USERS, req.fromUserId)

      const currentUserSnap = await getDoc(currentUserRef)
      const otherUserSnap = await getDoc(otherUserRef)


      if (!otherUserSnap.exists()) {
        Alert.alert("Virhe", "Käyttäjä on poistettu, et voi hyväksyä tätä kaveripyyntöä");
        await deleteDoc(doc(firestore, USERS, user.uid, FRIENDREQUESTS, req.id))
        return;
      } 


      const currentUserData = currentUserSnap.data()
      const otherUserData = otherUserSnap.data()

      await setDoc(doc(firestore, USERS, user.uid, "friends", req.fromUserId), {
        firstName: otherUserData.firstName,
        lastName: otherUserData.lastName,
        timestamp: serverTimestamp()
      })

      await setDoc(doc(firestore, USERS, req.fromUserId, "friends", user.uid), {
        firstName: currentUserData.firstName,
        lastName: currentUserData.lastName,
        timestamp: serverTimestamp()
      })

      await deleteRequests(req);
      await createPrivateChat(currentUserData, otherUserData, req.fromUserId);

      await setDoc(doc(firestore, USERS, req.fromUserId, "notifications", req.id), {
        type: "friend_accept",
        message: `${currentUserData.firstName} ${currentUserData.lastName} hyväksyi kaveripyynnön`,
        timestamp: serverTimestamp(),
        fromUserId: user.uid,
      })

    }catch (error) {
      console.error("Error accepting friend request:", error)
    } 

  }


  //Delete friend request when acchepting
  const deleteRequests = async (req) => {
    try {
      await deleteDoc(doc(firestore, USERS, user.uid, FRIENDREQUESTS, req.id))
    } catch (e) {
      console.log("Ei löytynyt omaa requestia", e)
    }
    let deletedOtherSide = false
    try {
      await deleteDoc(doc(firestore, USERS, req.fromUserId, FRIENDREQUESTS, req.id))
      deletedOtherSide = true
    } catch (e) {
      console.log("Ei löytynyt toisen requestia id:llä", e)
    }
    if (!deletedOtherSide) {
      try {
        const otherRequestsRef = collection(firestore, USERS, req.fromUserId, FRIENDREQUESTS)
        const q = query(
          otherRequestsRef,
          where("fromUserId", "==", req.fromUserId),
          where("toUserId", "==", req.toUserId),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docSnap) => {
          deleteDoc(doc(firestore, USERS, req.fromUserId, FRIENDREQUESTS, docSnap.id))
        });
      } catch (e) {
        console.log("Ei löytynyt toisen requestia kentän mukaan", e)
      }
    }
  }
  

  // Get priva chat id based on user ids
  const getChatId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  //Create private chat when accepting friend request
  const createPrivateChat = async (currentUserData, otherUserData, otherUserId) => {
    const chatId = getChatId(user.uid, otherUserId)

    try {
      await setDoc(doc(firestore, "privateChats", chatId), {
        user1: user.uid,
        user2: otherUserId,
        createdAt: serverTimestamp(),
      });

      await setDoc(
        doc(firestore, USERS, user.uid, "usersPrivateChats", chatId),
        {
          otherUser: otherUserId,
          otherUserName: `${otherUserData.firstName} ${otherUserData.lastName}`,
          latestMessage: "",
          unReadMessages: false,
          updatedAt: serverTimestamp(),
        }
      );

      await setDoc(
        doc(firestore, USERS, otherUserId, "usersPrivateChats", chatId),
        {
          otherUser: user.uid,
          otherUserName: `${currentUserData.firstName} ${currentUserData.lastName}`,
          latestMessage: "",
          unReadMessages: false,
          updatedAt: serverTimestamp(),
        }
      );

    } catch (error) {
      console.error("Error creating private chat:", error)
    }
  };




  //User declining friend request
  const handleDecline = async (req) => {

    // Check to see if the user is deleted, if so just delete the request and do nothing more
    if (req.isDeletedUser) {
        await handleRemoveRequest(req)
        return;
    }


    try {
      const requestRef = doc(firestore, USERS, user.uid, FRIENDREQUESTS, req.id)
      await updateDoc(requestRef, { status: "declined" })
    } catch (error) {
      console.error("Error declining own friend request:", error)
    }

    let updatedOtherSide = false
    try {
      const otherRequestRef = doc(firestore, USERS, req.fromUserId, FRIENDREQUESTS, req.id)
      await updateDoc(otherRequestRef, { status: "declined" })
      updatedOtherSide = true
    } catch (error) {
      console.log("Ei löytynyt toisen requestia id:llä decline:", error)
    }

    if (!updatedOtherSide) {
      try {
        const otherRequestsRef = collection(firestore, USERS, req.fromUserId, FRIENDREQUESTS)
        const q = query(
          otherRequestsRef,
          where("fromUserId", "==", req.fromUserId),
          where("toUserId", "==", req.toUserId),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach(async (docSnap) => {
          await updateDoc(doc(firestore, USERS, req.fromUserId, FRIENDREQUESTS, docSnap.id), { status: "declined" })
        });
      } catch (err) {
        console.error("Error declining friend request other side by query:", err);
      }
    }
  }

  // Mark notifications as read
  const markNotificationsReadData = async (notificationsData) => {
    const unread = notificationsData.filter(n => !n.read)
  
    if (!unread.length || !user) return;

    try {
      const batch = writeBatch(firestore)
      unread.forEach(n => {
        const notifRef = doc(firestore, USERS, user.uid, "notifications", n.id)
        batch.update(notifRef, { read: true })
      });
      await batch.commit()
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  };

  // Mark friend requests as read
  const markFriendRequestsReadData = async (friendRequestsData) => {
    const unread = friendRequestsData.filter(r => !r.read)
    
    if (!unread.length || !user) return;

    try {
      const batch = writeBatch(firestore);
      unread.forEach(r => {
        const reqRef = doc(firestore, USERS, user.uid, FRIENDREQUESTS, r.id)
        batch.update(reqRef, { read: true })
      });
      await batch.commit()
    } catch (error) {
      console.error('Error marking friend requests as read:', error)
    }
  };

  // Deleted user firend request remover
  const handleRemoveRequest = async (req) => {
  try {
    await deleteDoc(doc(firestore, USERS, user.uid, FRIENDREQUESTS, req.id))
    Alert.alert("Käyttäjä on poistettu", "Kaveripyyntö on poistettu, koska käyttäjä on poistanut tilinsä.")
  } catch (error) {
    console.error("Error removing request:", error)
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ilmoitukset</Text>

      {/* Uudet saapuneet pyynnöt */}
      {newFriendRequests.length > 0 && 
      <Text 
      style={{ 
        fontWeight: "bold", 
        fontSize: 16,
        marginTop:12,
        alignSelf: "center",
        }}
        >
          Uudet saapuneet pyynnöt:
          </Text>}
      {newFriendRequests.map((req) => (
        <View
          key={req.id}
          style={{width: "90%",
          alignItems: "center",
          alignSelf: "center",
          marginBottom: 10,
          marginTop: 24,
          paddingVertical: 12,
          borderBottomRightRadius: 16,
          backgroundColor: req.read ? "#f0f0f0" : "#d1e7dd",
          borderWidth: 1,
          borderColor: "#ccc",
          elevation: req.read ? 1 : 3,
        }}
        >
          <Text style={{ fontWeight: "bold", fontSize:24, color: req.status === "declined" ? "red" : "black" }}>
            {req.name} - {req.Date ? req.Date.toLocaleDateString() : ""} 
            {req.status === "declined" ? " (Hylätty)" : ""}
          </Text>
          {req.isDeletedUser ? (
            <TouchableOpacity onPress={() => handleRemoveRequest(req)}>
              <Text style={{ color: "red" }}>Poista X</Text>
            </TouchableOpacity>
          ) : (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
            <TouchableOpacity onPress={() => handleAccept(req)}>
              <Text style={{ color: "green" }}>Hyväksy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDecline(req)}>
              <Text style={{ color: "red" }}>X</Text>
            </TouchableOpacity>
          </View>
          )}
        </View>
      ))}

      {/* Luetut saapuneet pyynnöt */}
      {readFriendRequests.length > 0 && 
      <Text 
        style={{ 
        fontWeight: "bold",
        fontSize: 16,
        marginTop:12,
        alignSelf: "center"
         }}
         >
          Luetut saapuneet pyynnöt:
          </Text>}
      {readFriendRequests.map((req) => (
        <View
          key={req.id}
          style={{
          width: "90%",
          alignItems: "center",
          alignSelf: "center",
          marginBottom: 10,
          marginTop: 24,
          padding: 10,
          paddingVertical: 12,
          borderBottomRightRadius: 16,
          backgroundColor: "#f0f0f0",
          borderWidth: 1,
          borderColor: "#ccc",
          elevation: 1,
        }}
        >
          <Text style={{ fontWeight: "bold" }}>{req.name} - {req.Date ? req.Date.toLocaleDateString() : ""}</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
            <TouchableOpacity onPress={() => handleAccept(req)}>
              <Text style={{ color: "green" }}>Hyväksy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDecline(req)}>
              <Text style={{ color: "red" }}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Lähetetyt pyynnöt */}
      <View style={styles.pendingContainer}>
      {sentFriendRequests.filter(r => r.status !== "declined").length > 0 && 
      <Text 
      style={{ 
        fontWeight: "bold",
        fontSize: 16,
        alignSelf: "center"
         }}>Lähetetyt odottavat pyynnöt:</Text>}
      {sentFriendRequests.filter(r => r.status !== "declined").map((req) => (
        <Text 
        key={req.id}
        style={{
          fontWeight: "bold",
          color: "gray",
          alignSelf: "center",
          marginTop: 10,
         
        }}>{req.name} - {req.Date ? req.Date.toLocaleDateString() : ""}</Text>
      ))}
      </View>

      {/* Notifications */}
      {newNotifications.length > 0 && 
      <Text 
      style={{ 
        fontWeight: "bold",
        fontSize: 16,
        marginTop:12,
        alignSelf: "center"
         }}
         >
         Uudet ilmoitukset:</Text>}
      {newNotifications.map((notif) => (
        <View
          key={notif.id}
          style={{
            width: "90%",
            alignItems: "center",
            alignSelf: "center",
            marginBottom: 10,
            marginTop: 24,
            padding: 10,
            paddingVertical: 12,
            borderBottomRightRadius: 16,
            backgroundColor: notif.read ? "#f0f0f0" : "#ffeeba", 
            borderWidth: 1,
            borderColor: "#ccc",
            elevation: notif.read ? 1 : 3,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>{notif.message}</Text>
          <Text style={{ fontSize: 12, color: "#555" }}>
            {notif.timestamp?.toDate ? notif.timestamp.toDate().toLocaleDateString() : ""}
          </Text>
        </View>
      ))}

      {readNotifications.length > 0 && 
      <Text 
      style={{ 
        fontWeight: "bold",
        fontSize: 16,
        marginTop:12,
        alignSelf: "center"
         }}
         >
          Luetut ilmoitukset:
          </Text>}
      {readNotifications.map((notif) => (
        <View
          key={notif.id}
          style={{
            width: "90%",
            alignItems: "center",
            alignSelf: "center",
            marginBottom: 10,
            marginTop: 24,
            padding: 10,
            paddingVertical: 12,
            borderBottomRightRadius: 16,
            backgroundColor: "#f0f0f0",
            borderWidth: 1,
            borderColor: "#ccc",
            elevation: 1,
          }}
        >
          <Text>{notif.message}</Text>
          <Text style={{ fontSize: 12, color: "#555" }}>
            {notif.timestamp?.toDate ? notif.timestamp.toDate().toLocaleDateString() : ""}
          </Text>
        </View>
      ))}
    </View>
  );
}

