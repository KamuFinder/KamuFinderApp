import React, { use, useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, Alert,  } from "react-native";
import { useUser } from "../context/UserContext.js";
import { firestore, USERS, FRIENDREQUESTS, doc, getDoc, onSnapshot, setDoc} from "../firebase/config";
import { collection, deleteDoc, serverTimestamp, writeBatch, updateDoc} from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import styles from "../styles/Home.js";

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

        if (data.toUserId === user.uid) {
          const fromUserSnap = await getDoc(doc(firestore, USERS, data.fromUserId))
          if (fromUserSnap.exists()) {
            const fromData = fromUserSnap.data()
            name = `${fromData.firstName} ${fromData.lastName}` || "Tuntematon"
          }
          incomming.push({ id: docSnap.id, name, Date, ...data })

        } else if (data.fromUserId === user.uid) {
          const toUserSnap = await getDoc(doc(firestore, USERS, data.toUserId))
          if (toUserSnap.exists()) {
            const toData = toUserSnap.data()
            name = `${toData.firstName} ${toData.lastName}` || "Tuntematon"
          }
          outgoing.push({ id: docSnap.id, name, Date, ...data })
        }
      }
      setFriendRequests(incomming)
      setSentFriendRequests(outgoing)
  })

    return () => unsubscribe(); 
  }, [user]);


  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(firestore, USERS, user.uid, "notifications");
    const unsubscribe = onSnapshot(notificationsRef, (querySnapshot) => {
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notifications);
    });

    return () => unsubscribe();
  }, [user]);


  // Mark items as read when leaving the screen (blur event)
  useEffect(() => {
    if (listenerSetupRef.current) {
      return;
    }
    
    listenerSetupRef.current = true;

    const unsubscribeBlur = navigation.addListener('blur', async () => {
      try {
        await markFriendRequestsReadData(friendRequestsRef.current);
      } catch (error) {
        console.error('Error marking friend requests as read:', error);
      }
      
      try {
        await markNotificationsReadData(notificationsRef.current);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    });

    const unsubscribeFocus = navigation.addListener('focus', () => {
      // Screen is now focused
    });

    return () => {
      // Keep listeners alive throughout the session
    };
  }, [navigation]); 


  

  const handleAccept = async (req) => {
    try {
      const currentUserRef = doc(firestore, USERS, user.uid)
      const otherUserRef = doc(firestore, USERS, req.fromUserId)

      const currentUserSnap = await getDoc(currentUserRef)
      const otherUserSnap = await getDoc(otherUserRef)


      if (!otherUserSnap.exists()) {
        Alert.alert(
          "Virhe",
          "Käyttäjä on poistettu, et voi hyväksyä tätä kaveripyyntöä"
        );

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

  const deleteRequests = async (req) => {
    try {
    await deleteDoc(doc(firestore, USERS, user.uid, FRIENDREQUESTS, req.id));
  } catch (e) {
    console.log("Ei löytynyt omaa requestia");
  }

  try {
    await deleteDoc(doc(firestore, USERS, req.fromUserId, FRIENDREQUESTS, req.id));
  } catch (e) {
    console.log("Ei löytynyt toisen requestia");
  }
  }

  const handleDecline = async (req) => {
    try {
      const requestRef = doc(firestore, USERS, user.uid, FRIENDREQUESTS, req.id)
      await updateDoc(requestRef, { status: "declined" })

      const otherRequestRef = doc(firestore, USERS, req.fromUserId, FRIENDREQUESTS, req.id)
      await updateDoc(otherRequestRef, { status: "declined" })
    } catch (error) {
      console.error("Error declining friend request:", error)
    } 
  }

  const markNotificationsReadData = async (notificationsData) => {
    const unread = notificationsData.filter(n => !n.read);
    
    if (!unread.length || !user) return;

    try {
      const batch = writeBatch(firestore);
      unread.forEach(n => {
        const notifRef = doc(firestore, USERS, user.uid, "notifications", n.id);
        batch.update(notifRef, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markFriendRequestsReadData = async (friendRequestsData) => {
    const unread = friendRequestsData.filter(r => !r.read);
    
    if (!unread.length || !user) return;

    try {
      const batch = writeBatch(firestore);
      unread.forEach(r => {
        const reqRef = doc(firestore, USERS, user.uid, FRIENDREQUESTS, r.id);
        batch.update(reqRef, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking friend requests as read:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ilmoitukset</Text>

      {/* Uudet saapuneet pyynnöt */}
      {newFriendRequests.length > 0 && <Text style={{ fontWeight: "bold" }}>Uudet saapuneet pyynnöt:</Text>}
      {newFriendRequests.map((req) => (
        <View
          key={req.id}
          style={{
            marginBottom: 10,
            padding: 10,
            borderRadius: 8,
            backgroundColor: req.read ? "#f0f0f0" : "#d1e7dd",
            borderWidth: 1,
            borderColor: "#ccc",
          }}
        >
          <Text style={{ fontWeight: "bold", color: req.status === "declined" ? "red" : "black" }}>
            {req.name} - {req.Date ? req.Date.toLocaleDateString() : ""} 
            {req.status === "declined" ? " (Hylätty)" : ""}
          </Text>
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

      {/* Luetut saapuneet pyynnöt */}
      {readFriendRequests.length > 0 && <Text style={{ fontWeight: "bold" }}>Luetut saapuneet pyynnöt:</Text>}
      {readFriendRequests.map((req) => (
        <View
          key={req.id}
          style={{
            marginBottom: 10,
            padding: 10,
            borderRadius: 8,
            backgroundColor: "#f0f0f0",
            borderWidth: 1,
            borderColor: "#ccc",
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
      {sentFriendRequests.filter(r => r.status !== "declined").length > 0 && <Text style={{ fontWeight: "bold" }}>Lähetetyt odottavat pyynnöt:</Text>}
      {sentFriendRequests.filter(r => r.status !== "declined").map((req) => (
        <Text key={req.id}>{req.name} - {req.Date ? req.Date.toLocaleDateString() : ""}</Text>
      ))}

      {/* Notifications */}
      {newNotifications.length > 0 && <Text style={{ fontWeight: "bold" }}>Uudet ilmoitukset:</Text>}
      {newNotifications.map((notif) => (
        <View
          key={notif.id}
          style={{
            padding: 10,
            marginBottom: 5,
            borderRadius: 8,
            backgroundColor: notif.read ? "#f0f0f0" : "#ffeeba", 
            borderWidth: 1,
            borderColor: "#ccc",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>{notif.message}</Text>
          <Text style={{ fontSize: 12, color: "#555" }}>
            {notif.timestamp?.toDate ? notif.timestamp.toDate().toLocaleDateString() : ""}
          </Text>
        </View>
      ))}

      {readNotifications.length > 0 && <Text style={{ fontWeight: "bold" }}>Luetut ilmoitukset:</Text>}
      {readNotifications.map((notif) => (
        <View
          key={notif.id}
          style={{
            padding: 10,
            marginBottom: 5,
            borderRadius: 8,
            backgroundColor: "#f0f0f0",
            borderWidth: 1,
            borderColor: "#ccc",
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

