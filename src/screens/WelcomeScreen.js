import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#555",
  },
  loginButton: {
    width: "80%",
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  signupButton: {
    width: "80%",
    padding: 15,
    backgroundColor: "#2196F3",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});