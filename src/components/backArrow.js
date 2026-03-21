import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function BackButton() {
    const navigation = useNavigation();
    const fit = useSafeAreaInsets();
  

  return (
    <View style={[styles.container, {top: fit.top +10 }]}>
      <TouchableOpacity onPress={() =>  navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
});