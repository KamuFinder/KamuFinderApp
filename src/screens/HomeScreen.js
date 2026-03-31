import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity,Image, TextInput, Alert } from "react-native";
import { useUser } from "../context/UserContext.js";
import { useNavigation } from "@react-navigation/native";
import { firestore, USERS, FRIENDREQUESTS, doc, getDoc, collection, onSnapshot, addDoc, serverTimestamp, setDoc} from "../firebase/config";
import styles from "../styles/Home.js";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../../assets/Logo.png";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import FriendRequestButton from "../components/FriendRequestButton.js";
import UserAvatar from "../components/UserAvatar.js";

export default function HomeScreen() {
  const user = useUser();
  const [firstName, setFirstName] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [ searchQuery , setSearchQuery ] = useState('');
  const [listOfUsers, setUsersList] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [allFriendRequests, setAllFriendRequests] = useState([]);
  const navigation = useNavigation();


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
        avatarSeed: doc.data().avatarSeed || "",
        avatarStyle: doc.data().avatarStyle || "",
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
      
      setAllFriendRequests(requests);
    });
    
    return () => unsubscribe();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      // Kun screen tulee fokukseen → ei tehdä mitään

      return () => {
        // Kun poistutaan screeniltä → tyhjennetään
        setSearchQuery("");
        setFilteredUsers([]);
      };
    }, [])
  );


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
              filteredUsers.map((u) => (
                <View key= {u.id} style={styles.friendReguestbutton}>

                    <TouchableOpacity 
                        onPress={() => navigation.navigate("Profile", { userId: u.id })}
                         style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}
                    >
  
                    <UserAvatar
                      avatarSeed={u.avatarSeed}
                      avatarStyle={u.avatarStyle}
                      size={30}
    />
                    <View style={{ marginLeft: 8, flexShrink: 1 }}>
                      <Text 
                        style={{ color: "#000", fontWeight: "bold", marginRight: 24 }}> {u.firstName} {u.lastName} 
                      </Text>
                    </View>                   
                    </TouchableOpacity>

                    <FriendRequestButton
                      user={user}
                      targetUserId={u.id}
                      friendsList={friendsList}
                      allFriendRequests={allFriendRequests}
                    />
                  </View>
              
              ))
            ) : (
              <Text>Ei tuloksia</Text>
            )}
          </View>
        )}

      </View>

    </View>
    
  );
}