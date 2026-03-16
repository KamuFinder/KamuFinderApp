import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../styles/Welcome.js";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tervetuloa 😊</Text>

      <Text style={styles.subtitle}>
        Kirjaudu sisään napista aukee sit SignInScreen.js ja Luo käyttäjä SignUpScreen.js
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("SignIn")}
      >
        <Text style={styles.buttonText}>Kirjaudu sisään</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text style={styles.buttonText}>Luo käyttäjä</Text>
      </TouchableOpacity>
    </View>
  );
}

