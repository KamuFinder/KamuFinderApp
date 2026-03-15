import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SignUpScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tämä on Rekisteröitymissivu</Text>

      

      <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
        <Text style={styles.link}>Takaisin etusivulle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  link: {
    color: "blue",
  },
});