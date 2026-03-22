import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NavbarBottom() {
  const navigation = useNavigation();
  const route = useRoute();
  const fit = useSafeAreaInsets();

  const isHomeScreen = route.name === "Home"

  return (    
    <View style={[styles.bottomBar, {paddingBottom: fit.bottom}]}>

    {/*Left Group navigate button*/}
      <TouchableOpacity 
        style={styles.buttonContainer} 
        onPress={() => navigation.navigate("GroupsScreen")}>
        <MaterialIcons name="groups" size={28} color={route.name === "GroupsScreen" ? "#000" : "#999"} />
      </TouchableOpacity>

    {/*Middle changing button, user on home screen -> swapping/ any other -> home button */}
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={() => navigation.navigate(isHomeScreen ? "Swiping" : "Home")}>
        <MaterialIcons name={isHomeScreen ? "favorite" : "home"} size={28} color={!isHomeScreen ? "#999" : "#facbcb"} />
      </TouchableOpacity>

    {/*Right Chats navigate button */}
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={() => navigation.navigate("PrivaChats")}>
        <MaterialIcons name="chat" size={26} color={route.name === "PrivaChats" ? "#000" : "#999"} />
      </TouchableOpacity>


    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8ECF4",
  },
    buttonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },


});