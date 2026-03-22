import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function NavbarTop({ showBack = false, showProfile = false }) {
    const navigation = useNavigation();
    const fit = useSafeAreaInsets();
  

  return (
    <View style={[styles.container, {paddingTop: fit.top +15 }]}>
      {showBack && (
      <TouchableOpacity onPress={() =>  navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} />
      </TouchableOpacity>
      )}

      <View style={{flex:1}}/>

      {showProfile && (
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-circle-outline" size={50} />
        </TouchableOpacity>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
});