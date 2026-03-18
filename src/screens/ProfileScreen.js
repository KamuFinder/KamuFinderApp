import React, { useEffect, useState} from "react";
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, Alert, Modal, FlatList} from "react-native";
import { firestore, USERS, doc, getDoc, FRIENDS, auth, signOut} from '../firebase/config.js'
import { collection, onSnapshot, getDocs} from "firebase/firestore";
import styles from "../styles/Profile.js";
import { useUser } from "../context/UserContext.js";



export default function ProfileScreen() {
    const navigation = useNavigation()
    const user = useUser()
    const [userInfo, setUserInfo] = useState({
        firstName: '',
        lastName: '',
        nickName: '',
        city: '',
        profile_text: '',
        intrests: '',
    })
    const [friendsCount, setFriendsCount] = useState(0);
    const [friendsList, setFriendsList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);


    useEffect(() => {
        const fetchUserData = async () => {
        if (!user) return

        const ref = doc(firestore, USERS, user.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
            setUserInfo({
                firstName: snap.data().firstName || '',
                lastName: snap.data().lastName || '',
                nickName: snap.data().nickName || '',
                city: snap.data().city || '',
                profile_text: snap.data().profile_text || '',
                intrests: snap.data().intrests || '',
            })
        }
        }
        fetchUserData()

        const friendsRef = collection(firestore, USERS, user.uid, FRIENDS)
        const unsubscribe = onSnapshot(friendsRef, async (snapshot) => {
            setFriendsCount(snapshot.size);

            const names = snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    name: `${data.firstName || "Tuntematon"} ${data.lastName || ""}`,
                    createdAt: data.timestamp || null
                }
            })

            setFriendsList(names)
        })
        
        return() => unsubscribe();
        
        
    }, [user])


    const confirmSignOut = () => {
        Alert.alert(("Kirjaudu ulos"), ("Oletko varma että haluat kirjautua ulos?"),[
          {
            text: ("Kirjaudu ulos"),
            onPress: () => userSignOut(),
          },
          {
            text: ("Peruuta")
          }
        ])
    }
    
    const userSignOut = () => {
        signOut(auth)
          .then(() =>{
          })
          .catch((error) => {
             Alert.alert(t("error"), error.message)
          })
    }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profiilisivu</Text>
      

      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Text style={[{color: "red"}]}>{("Kotiin")}</Text>
      </TouchableOpacity>

      <Text>Sähköposti: {user?.email}</Text>

      <Text>Etunimi: {userInfo.firstName}</Text>
      <Text>Sukunimi: {userInfo.lastName}</Text>
      <Text>Nickname: {userInfo.nickName}</Text>
      <Text>Kaupunki: {userInfo.city}</Text>
      <Text>Profiiliteksti: {userInfo.profile_text}</Text>
      <Text>Kiinnostuksen kohteet: {userInfo.intrests}</Text>
      

      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={{ color: "blue" }}>Ystävien määrä: {friendsCount}</Text>
      </TouchableOpacity>


      <TouchableOpacity onPress={() => confirmSignOut()}>
        <Text style={[{color: "red"}]}>{("sign-out")}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Ystävät</Text>
          <FlatList
            data={friendsList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
                const date = item.createdAt?.toDate
                ? item.createdAt.toDate().toLocaleDateString("fi-Fi")
                : "Ei tiedossa";

                return(
                    <Text style={styles.modalItem}>{item.name} ystävä alkaen: {date}</Text>
                )
            }}
          />
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.modalClose}>Sulje</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      
    </View>
  );
}
