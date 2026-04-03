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
    <View style={[styles.bottomWrapper, {paddingBottom: fit.bottom}]}>
    <View style={styles.bottomBar}>

    {/*Left Group navigate button*/}
      <TouchableOpacity 
        style={styles.buttonContainer} 
        onPress={() => navigation.navigate("GroupsScreen")}>
        <MaterialIcons name="groups" size={32} color={route.name === "GroupsScreen" ? "#FB7318" : "#999"} />
      </TouchableOpacity>

    {/*Middle changing button, user on home screen -> swapping/ any other -> home button */}
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={() => navigation.navigate(isHomeScreen ? "Swiping" : "Home")}>
        <MaterialIcons name={isHomeScreen ? "favorite" : "home"} size={32} color={!isHomeScreen ? "#999" : "#f00c0c"} />
      </TouchableOpacity>

    {/*Right Chats navigate button */}
      <TouchableOpacity 
        style={styles.buttonContainer}
        onPress={() => navigation.navigate("PrivaChats")}>
        <MaterialIcons name="chat" size={32} color={route.name === "PrivaChats" ? "#FB7318" : "#999"} />
      </TouchableOpacity>


    </View>
    </View>
  );
}

const styles = StyleSheet.create({

  bottomWrapper: {
    position: "absolute",
    left: 0, 
    right: 0,
    bottom: 0,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  bottomBar: {
    width: "98%",
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    paddingVertical: 8,
    elevation: 3,
  },
    buttonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },


});