import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useUser } from "../context/UserContext.js";
import { useNavigation } from "@react-navigation/native";
import { firestore, USERS, doc, getDoc } from "../firebase/config";
import styles from "../styles/Home.js";
import { Ionicons } from "@expo/vector-icons";

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

      {/* 👤 Profiili 
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate("Profile")}
      >
        <Ionicons name="person-circle-outline" size={32} color="black" />
      </TouchableOpacity> */}

      {/* 💬 Keskustelut 
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate("PrivaChats")}
      >
        <Ionicons name="chatbubble-outline" size={24} color="white" />
      </TouchableOpacity> */}

      {/* 📄 Sisältö */}
      <Text style={styles.title}>Kotisivu</Text>
      <Text style={styles.helloUser}>Tervetuloa {firstName}</Text>

    </View>
  );
}