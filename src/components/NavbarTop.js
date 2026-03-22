import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function NavbarTop({ showBack = false, showProfile = false, showNotifications = false  }) {
    const navigation = useNavigation();
    const fit = useSafeAreaInsets();
  

  return (
    <View style={[styles.container, {paddingTop: fit.top +15 }]}>
      
      <View style={{width:40}}>

      {showBack ? (
      <TouchableOpacity onPress={() =>  navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} />
      </TouchableOpacity>
      ) : showNotifications ? (
        <TouchableOpacity onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons name="notifications-circle-outline" size={40} />
        </TouchableOpacity>
      ) : null}
      </View>


      <View style={{flex:1}}/>

      {showProfile && (
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-circle-outline" size={40} />
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