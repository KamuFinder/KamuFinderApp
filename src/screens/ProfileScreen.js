import React, { useEffect, useState} from "react";
import { CommonActions, useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import styles from "../styles/SignIn_And_Up.js";


export default function ProfileScreen() {
      const navigation = useNavigation()
    

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profiilisivu</Text>
      

      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Text style={[{color: "red"}]}>{("Kotiin")}</Text>
      </TouchableOpacity>


      
    </View>
  );
}
