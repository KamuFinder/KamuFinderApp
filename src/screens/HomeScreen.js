import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity,Image, TextInput } from "react-native";
import { useUser } from "../context/UserContext.js";
import { useNavigation } from "@react-navigation/native";
import { firestore, USERS, doc, getDoc } from "../firebase/config";
import styles from "../styles/Home.js";
import { Ionicons } from "@expo/vector-icons";
import NavbarBottom from "../components/NavbarBottom";
import Logo from "../../assets/Logo.png";

export default function HomeScreen() {
  const user = useUser();
  const [firstName, setFirstName] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      const ref = doc(firestore, USERS, user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setFirstName(snap.data().firstName);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <View style={styles.container}>

      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.logo} />
      </View>

      <Text style={styles.helloUser}>Tervetuloa takaisin {firstName}!</Text>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Etsi kaveria nimellä"
            
          />
          <Ionicons name="search" size={20} color="#000000" style={{ marginRight: 8 }} />

        </View>

      </View>

    </View>
    
  );
}