import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import {firestore,USERS,doc,getDoc,FRIENDS,auth,signOut,} from "../firebase/config.js";
import { collection, onSnapshot } from "firebase/firestore";
import styles from "../styles/Profile.js";
import { useUser } from "../context/UserContext.js";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import Divider from "../components/Divider.js";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const user = useUser();

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    nickName: "",
    city: "",
    profile_text: "",
    intrests: "",
  });

  const [friendsCount, setFriendsCount] = useState(0);
  const [friendsList, setFriendsList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const isOwnProfile = true; // Placeholder, can be used for future features like viewing other users' profiles

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      const ref = doc(firestore, USERS, user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setUserInfo({
          firstName: snap.data().firstName || "",
          lastName: snap.data().lastName || "",
          nickName: snap.data().nickName || "",
          city: snap.data().city || "",
          profile_text: snap.data().profile_text || "",
          intrests: snap.data().intrests || "",
        });
      }
    };

    fetchUserData();

    const friendsRef = collection(firestore, USERS, user.uid, FRIENDS);

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
  }, [user]);

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


  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Text style={styles.title}>Profiilisivu</Text>

      {isOwnProfile && (
        <TouchableOpacity
      onPress ={() => setMenuVisible(true)}
      style={styles.menuIcon}
    >
      <Ionicons name="ellipsis-vertical" size={24} />
    </TouchableOpacity>
      )}
      </View>

      <View style={styles.infoContainer}>
        <View style={{ alignItems: "center" }}>
          <Ionicons name="person-circle" size={100} color="#e6500a" />
        </View>
        <View style={{ marginLeft: 24, flex: 1 }}>
          <Text style={{fontSize: 18, fontWeight: "bold"}}>{userInfo.nickName}</Text>
          <Text>{userInfo.firstName} {userInfo.lastName}</Text>
          <Text>{user?.email}</Text>
          <Text>Kaupunki: {userInfo.city}</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer2}>
      

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={{ flexDirection: "row", alignItems: "center",marginBottom: 16 }}>
            <FontAwesome5 name="user-friends" size={24} color="#de58c8"/>
             <Text style={{paddingHorizontal: 10}}>{friendsCount}</Text>
          </View>
          

           <Text style={{fontFamily:"monospace",paddingVertical: 10}}>Kiinnostuksen kohteet: {userInfo.intrests}</Text>
            <Text style={{fontFamily:"monospace",paddingVertical: 10}}>Profiiliteksti: {userInfo.profile_text}</Text>
        </TouchableOpacity>
        
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