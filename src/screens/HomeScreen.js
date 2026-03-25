import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity,Image, TextInput, Alert } from "react-native";
import { useUser } from "../context/UserContext.js";
import { useNavigation } from "@react-navigation/native";
import { firestore, USERS, doc, getDoc, collection, onSnapshot} from "../firebase/config";
import styles from "../styles/Home.js";
import { Ionicons } from "@expo/vector-icons";
import NavbarBottom from "../components/NavbarBottom";
import Logo from "../../assets/Logo.png";

export default function HomeScreen() {
  const user = useUser();
  const [firstName, setFirstName] = useState("");
  const navigation = useNavigation();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [ searchQuery , setSearchQuery ] = useState('');
  const [listOfUsers, setUsersList] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [hobbyRecommendations, setHobbyRecommendations] = useState([]);


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


  const handleFriendRequest = (u) => {
    Alert.alert("Ystävä pyyntö", `Nappia painettu käyttäjälle ${u.firstName} ${u.lastName}`)
  }

  //Kiinnostustenkohteiden haku

const fetchHobbyRecommendations = async () => {
  try {
    const response = await fetch("http://192.168.0.14:8000/recommend/hobby/1");
    const data = await response.json();

    if (data.error) {
      Alert.alert("Virhe", data.error);
      return;
    }

    setHobbyRecommendations(data.recommendations || []);
  } catch (error) {
    console.log("Virhe hobby-suositusten haussa:", error);
    Alert.alert("Virhe", "Kaverisuosituksia ei voitu hakea");
  }
};
  
  return (
    <View style={styles.container}>

      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.logo} />
      </View>

      <Text style={styles.helloUser}>Tervetuloa takaisin {firstName}!</Text>

  
      <TouchableOpacity
        style={styles.actionButton}
        onPress={fetchHobbyRecommendations}
>
       <Text style={styles.actionButtonText}>Etsi kavereita</Text>
      </TouchableOpacity>

      <NavbarBottom />



{hobbyRecommendations.length > 0 && (
  <View style={styles.recommendationsContainer}>
    <Text style={styles.recommendationsTitle}>Suositellut kaveriryhmät</Text>

    {hobbyRecommendations.map((item) => (
      <View key={item.group_id} style={styles.recommendationCard}>
        <Text style={styles.recommendationName}>{item.group_name}</Text>
        <Text>{item.description}</Text>
        <Text>Jäseniä: {item.member_count}</Text>
        <Text>Match score: {item.score}</Text>
      </View>
    ))}
  </View>
)}



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
                const isFriend = friendsList.some(f => f.id === u.id)
                return (
                  <View key= {u.id} style={styles.friendReguestbutton}>
                    <Text> {u.firstName} {u.lastName} </Text>
                    {!isFriend && (
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