import React, { useEffect, useState, useCallback } from "react";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import { View, Text, TouchableOpacity, Alert, Modal, FlatList, Image} from "react-native";
import {firestore,USERS,doc,getDoc,setDoc,deleteDoc, serverTimestamp,FRIENDS,auth,signOut, FRIENDREQUESTS} from "../firebase/config.js";
import { collection, onSnapshot } from "firebase/firestore";
import styles from "../styles/Profile.js";
import { useUser } from "../context/UserContext.js";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import Divider from "../components/Divider.js";
import FriendRequestButton from "../components/FriendRequestButton.js";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const user = useUser();

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    nickName: "",
    city: "",
    profile_text: "",
    study_interests: [],
    hobby_interests: [],
    avatarSeed: "",
    avatarStyle: "fun-emoji",
  });

  const [friendsCount, setFriendsCount] = useState(0);
  const [friendsList, setFriendsList] = useState([]);
  const [allFriendRequests, setAllFriendRequests] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  // Params for checking if it's own profile or not
  const  route = useRoute()
  const profileUserId = route.params?.userId || user?.uid;
  const isOwnProfile = profileUserId === user?.uid;

  const normalizedAvatarStyle =
  userInfo.avatarStyle === "fun emoji" ? "fun-emoji" : (userInfo.avatarStyle || "fun-emoji");

  const avatarUrl = userInfo.avatarSeed
  ? `https://api.dicebear.com/9.x/${normalizedAvatarStyle}/png?seed=${encodeURIComponent(userInfo.avatarSeed)}`
  : null;

  
  // Get users data from firebase and set it to state
  const fetchUserData = async () => {
      if (!user) return;

      const ref = doc(firestore, USERS, profileUserId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const profileData = {
          firstName: snap.data().firstName || "",
          lastName: snap.data().lastName || "",
          nickName: snap.data().nickName || "",
          city: snap.data().city || "",
          profile_text: snap.data().profile_text || "",

         // varmistus kun en ole varma miten Firestoressa on interests
          interests: snap.data().interests || snap.data().intrests || [],

          hobby_interests: snap.data().hobby_interests || [],
          study_interests: snap.data().study_interests || [],
          avatarSeed: snap.data().avatarSeed || "",
          avatarStyle: snap.data().avatarStyle || "fun-emoji",
        };
        setUserInfo(profileData);

        if (isOwnProfile) {
          await checkProfileCompletionAndNotify(profileData);
        }
      }
    };

      useFocusEffect(
        useCallback(() => {
        fetchUserData();
      }, [user,profileUserId, isOwnProfile])
      );


  // Get friends list and count from firebase
  useEffect(() => {
    if (!profileUserId) return;

    const friendsRef = collection(firestore, USERS, profileUserId, FRIENDS);

    const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
      setFriendsCount(snapshot.size);

      const names = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: `${data.firstName || "Tuntematon"} ${data.lastName || ""}`,
          createdAt: data.timestamp || null,
        };
      });

      setFriendsList(names);
    });

    return () => unsubscribe();
  }, [profileUserId]);

  // Get all friend requests (sent and received) for the user
  useEffect(() => {
    if (!user) return;

    const friendRequestsRef = collection(firestore, USERS, user.uid, FRIENDREQUESTS);
    const unsubscribe = onSnapshot(friendRequestsRef, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllFriendRequests(requests);
    });

    return () => unsubscribe();
  }, [user]);

  // Sign out function and confirmation alert
  const confirmSignOut = () => {
    Alert.alert(
      "Kirjaudu ulos",
      "Oletko varma että haluat kirjautua ulos?",
      [
        {
          text: "Kirjaudu ulos",
          onPress: () => userSignOut(),
        },
        {
          text: "Peruuta",
        },
      ]
    );
  };
  const userSignOut = () => {
    signOut(auth).catch((error) => {
      Alert.alert("Error", error.message);
    });
  };

  const checkProfileCompletionAndNotify = async (profileData) => {
  if (!user || !isOwnProfile) return;

  const missingFields = [];

  if (!profileData.city || profileData.city.trim() === "") {
    missingFields.push("paikkakunta");
  }

  if (!profileData.profile_text || profileData.profile_text.trim() === "") {
    missingFields.push("profiiliteksti");
  }

  const hasStudyInterests =
    Array.isArray(profileData.study_interests) &&
    profileData.study_interests.length > 0;

  const hasHobbyInterests =
    Array.isArray(profileData.hobby_interests) &&
    profileData.hobby_interests.length > 0;

  if (!hasStudyInterests) {
    missingFields.push("Opiskelu");
  }

  if (!hasHobbyInterests) {
    missingFields.push("Harrastukset");
  }

  const notifRef = doc(firestore, USERS, user.uid, "notifications", "incomplete-profile");

  try {
    if (missingFields.length > 0) {
      await setDoc(notifRef, {
        type: "profile_incomplete",
        message: `Profiilistasi puuttuu vielä: ${missingFields.join(", ")}. Viimeistele profiilisi, jotta muut käyttäjät näkevät sinusta enemmän.`,
        read: false,
        screen: "Profile",
        persistent: true,
        timestamp: serverTimestamp(),
      });
    } else {
      await deleteDoc(notifRef);
    }
  } catch (error) {
    console.error("Error handling profile completion notification:", error);
  }
};


  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Text style={styles.title}>Profiilisivu</Text>

      {/*
      <Text>Opiskelukiinnostukset: {userInfo.interests.length > 0 ? userInfo.interests.join(", ") : "Ei asetettu"}</Text>
      <Text>Harrastuskiinnostukset: {userInfo.hobby_interests.length > 0 ? userInfo.hobby_interests.join(", ") : "Ei asetettu"}</Text>
      */}
      
        
        {isOwnProfile && (
          <TouchableOpacity
            onPress ={() => setMenuVisible(true)}
            style={styles.menuIcon}
          >
          <Ionicons name="ellipsis-vertical" size={24} />
          </TouchableOpacity>
        )}
        
        {!isOwnProfile && (
          <FriendRequestButton
            user={user}
            targetUserId={profileUserId}  
            friendsList={friendsList}
            allFriendRequests={allFriendRequests}
          />
        )}
      </View>

      <View style={styles.infoContainer}>
        
        <View style={{ alignItems: "center" }}>
          {avatarUrl && (
          <Image
              source={{ uri: avatarUrl }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
          />
          )}
        </View>
        
        <View style={{ marginLeft: 24, flex: 1 }}>
          <Text style={{fontSize: 18, fontWeight: "bold"}}>{userInfo.nickName}</Text>
          <Text>{userInfo.firstName} {userInfo.lastName}</Text>
          {/* Email only shown on own profile for privacy reasons */}
          {isOwnProfile && <Text>{user?.email}</Text>}
          <Text>Kaupunki: {userInfo.city}</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer2}>
      

        {isOwnProfile && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}>
              <FontAwesome5 name="user-friends" size={24} color="#de58c8"/>
              <Text style={{paddingHorizontal: 10}}>{friendsCount}</Text>
            </View>
          </TouchableOpacity>
        )}
          

           <Text style={{fontFamily:"monospace",paddingVertical: 10}}>Opiskelu: {userInfo.study_interests.length > 0 ? userInfo.study_interests.join(", ") : "Ei asetettu"}</Text>
           <Text style={{fontFamily:"monospace",paddingVertical: 10}}>Harrastukset: {userInfo.hobby_interests.length > 0 ? userInfo.hobby_interests.join(", ") : "Ei asetettu"}</Text>
            <Text style={{fontFamily:"monospace",paddingVertical: 10}}>"{userInfo.profile_text}"</Text>
        
      </View>

      <Divider />

      

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay} />
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Ystävät</Text>

          <FlatList
            data={friendsList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item }) => {
              const date = item.createdAt?.toDate
                ? item.createdAt.toDate().toLocaleDateString("fi-FI")
                : "Ei tiedossa";

              return (
                <View style={styles.friendRow}>
                  <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name}</Text>
                  <Text style={styles.friendDate}>
                    ystävä alkaen: {date}
                </Text>
                  </View>

                  <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => Alert.alert("Poista ystävä", "Haluatko varmasti poistaa tämän ystävän?", [
                  {
                    text: "Kyllä",
                    onPress: () => {} // Poista ystävä logiikka tähän
                  },
                  { text: "Ei" }
                ])}
              >
                <Ionicons name="trash" size={24} color="#0b0a0a" />
              </TouchableOpacity>
                </View>
              );
            }}
          />

          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.modalClose}>Sulje</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      > 
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.dropdown}>
            <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate("EditProfile");
            }}
          >
            
            <Text style={styles.dropdownItemText}>Muokkaa profiilia</Text>
          </TouchableOpacity>

          <TouchableOpacity
          style={styles.dropdownItem}
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate("ChangePassword");
          }}
        >
          <Text style={styles.dropdownItemText}>Vaihda salasana</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => confirmSignOut()}>
        <Text style={styles.signOut}>sign-out</Text>
      </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>

    </View>

  );
}