import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useUser } from "../context/UserContext.js";
import styles from "../styles/Home.js";

export default function HomeScreen() {
  const user = useUser();

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Swaippailu sivu</Text>

    </View>
  );
}