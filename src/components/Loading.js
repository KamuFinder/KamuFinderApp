import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

export default function Loading({ text = "Ladataan..." }) {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: "center", 
      alignItems: "center" 
    }}>
      <ActivityIndicator size="large" color="#2848ff" />
      <Text style={{ marginTop: 10 }}>{text}</Text>
    </View>
  );
}