import React, { useEffect, useState} from "react";
import { View, Text, TouchableOpacity, } from "react-native";
import { useUser } from "../context/UserContext.js";
import {  useNavigation } from '@react-navigation/native';
import { firestore, USERS, doc, getDoc } from "../firebase/config";
import { auth, signOut } from "../firebase/config";

import styles from "../styles/Home.js";

export default function HomeScreen() {
  const user = useUser()
  const [firstName, setFirstName] = useState("")
  const navigation = useNavigation()
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      const ref = doc(firestore, USERS, user.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setFirstName(snap.data().firstName)
      }
    }
    fetchUserData()
  }, [user])



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kotisivu</Text>
      <Text style={styles.helloUser}>Tervetuloa {firstName}</Text>


      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <Text style={[{color: "red"}]}>{("Profiilisivu")}</Text>
      </TouchableOpacity>


      
    </View>
  );
}
