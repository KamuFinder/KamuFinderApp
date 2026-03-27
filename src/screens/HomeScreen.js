import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity,Image, TextInput, Alert } from "react-native";
import { useUser } from "../context/UserContext.js";
import { useNavigation } from "@react-navigation/native";
import { firestore, USERS, FRIENDREQUESTS, doc, getDoc, collection, onSnapshot, addDoc, serverTimestamp,} from "../firebase/config";
import styles from "../styles/Home.js";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../../assets/Logo.png";
import { API_BASE_URL } from "../firebase/config";
import NavbarBottom from "../components/NavbarBottom";


export default function HomeScreen() {
  const user = useUser();
  const [firstName, setFirstName] = useState("");
  const navigation = useNavigation();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [ searchQuery , setSearchQuery ] = useState('');
  const [listOfUsers, setUsersList] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [sentFriendRequests, setSentFriendRequests] = useState([]);
  const [receivedFriendRequests, setReceivedFriendRequests] = useState([]);
  const [allFriendRequests, setAllFriendRequests] = useState([]);


  useEffect(() => {
    // Users first and last name from firebase
    const fetchUserData = async () => {
      if (!user) return;

      const ref = doc(firestore, USERS, user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setFirstName(snap.data().firstName);
      }
    }
    fetchUserData();

    //Query for gettin all users full names
    const usersQuery = collection(firestore, USERS);

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        firstName: doc.data().firstName,
        lastName: doc.data().lastName,
      })). filter( (u) => u.id !== user.uid)
      setUsersList(usersList)
    })
    return () => unsubscribe()
  }, [user]);


  // Checks if user is already friend of user
  useEffect(() => {
    if(!user) return
      const friendsRef = collection(firestore, USERS, user.uid, "friends");
      const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
        const friends = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setFriendsList(friends);
    })
    return () => unsubscribe()

  }, [user]);

  // Checks pending friend requests (sent and received)
  useEffect(() => {
    if(!user) return;
    
    const friendRequestsRef = collection(firestore, USERS, user.uid, FRIENDREQUESTS);
    const unsubscribe = onSnapshot(friendRequestsRef, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filtteröi vain pending pyynnöt
      const sent = requests.filter(r => r.fromUserId === user.uid && r.status === "pending");
      const received = requests.filter(r => r.toUserId === user.uid && r.status === "pending");
      
      setSentFriendRequests(sent);
      setReceivedFriendRequests(received);
      
      // Kaikki pyynnöt (pending ja declined) - estää uudestaan lähettämisen
      setAllFriendRequests(requests);
    });
    
    return () => unsubscribe();
  }, [user]);


  // Handles the search query input, filters the list of users, and updates the filtered results
  const handleSearch =  (query) => {
    setSearchQuery(query)

    // if the input is "" then no search yet
    if (query.trim() === "") {
      setFilteredUsers([]);
      return;
    }
    const formattedQuery = query.toLowerCase()

  let results = [];

  if (formattedQuery.length === 1) {
    results = listOfUsers.filter(
      (user) =>
        user.firstName?.toLowerCase().startsWith(formattedQuery) ||
        user.lastName?.toLowerCase().startsWith(formattedQuery)
    );
  } else {
    results = listOfUsers.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(formattedQuery) ||
        user.lastName?.toLowerCase().includes(formattedQuery)
    );
  }
    setFilteredUsers(results)
  };

  // fuction to handle friend requests 
  const handleFriendRequest = async (u) => {

    try {
      const currentUserRequestsRef = collection(firestore, USERS, user.uid, FRIENDREQUESTS)
      const targetUserRequestsRef = collection(firestore, USERS, u.id, FRIENDREQUESTS)
      
      const requestData = {
        fromUserId: user.uid,
        toUserId: u.id,
        status: "pending",
        timestamp: serverTimestamp(),
      }
      await addDoc(currentUserRequestsRef, requestData)
      await addDoc(targetUserRequestsRef, requestData)

      Alert.alert("Pyyntö lähetetty", `Kaveripyyntö lähetetty käyttäjälle ${u.firstName} ${u.lastName}`)
    } catch (error) {
      console.error("Error sending friend request:", error)
      Alert.alert("Virhe", "Kaveripyynnön lähetys epäonnistui.")
    }

  }

  
  return (
    <View style={styles.container}>

      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.logo} />
      </View>

      <Text style={styles.helloUser}>Tervetuloa takaisin {firstName}!</Text>

      <Text style={{ marginTop: 12, marginBottom: 12 }}>Löydä uusia kavereita sydän-välilehdeltä!</Text>

      




      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Etsi kaveria nimellä"
            autoCapitalize="none" 
            autoCorrect={false}
            value={searchQuery}
            onChangeText={(query) => handleSearch(query)}
            
          />
          <Ionicons name="search" size={20} color="#000000" style={{ marginRight: 8 }} />

        </View>
        {searchQuery.length > 0 && (
          <View style={{ marginTop: 10 }}>
            
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => {
                const isFriend = friendsList.some(f => f.id === u.id);
                const userRequest = allFriendRequests.find(r => 
                  (r.fromUserId === user.uid && r.toUserId === u.id) || 
                  (r.toUserId === user.uid && r.fromUserId === u.id)
                );
                const hasRequest = !!userRequest;
                const isPending = userRequest?.status === "pending";
                const isDeclined = userRequest?.status === "declined";
                
                return (
                  <View key= {u.id} style={styles.friendReguestbutton}>
                    <Text> {u.firstName} {u.lastName} </Text>
                    {!isFriend && !hasRequest && (
                      <TouchableOpacity
                        onPress={() => handleFriendRequest(u)}
                        style={{
                          backgroundColor: "#e7e7e7",
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>+</Text>
                      </TouchableOpacity>
                    )}
                    {isPending && (
                      <Text style={{ color: "#999", fontSize: 12 }}>Odottavissa</Text>
                    )}
                    {isDeclined && (
                      <Text style={{ color: "#aaa", fontSize: 12 }}>Hylätty</Text>
                    )}
                  </View>
                )
              
              })
            ) : (
              <Text>Ei tuloksia</Text>
            )}
          </View>
        )}

      </View>

    </View>
    
  );
}