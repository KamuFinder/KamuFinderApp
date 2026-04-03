import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UserAvatar from "./UserAvatar.js";
import { useUser } from "../context/UserContext";
import { firestore, USERS, onSnapshot,doc ,} from "../firebase/config.js";
import useUnreadCounts from "../hooks/useUnreadCounts.js";

export default function NavbarTop({ showBack = false, showProfile = false, showNotifications = false  }) {
  const navigation = useNavigation();
  const fit = useSafeAreaInsets();
  const user= useUser();
  const { totalNotifications } = useUnreadCounts();

  const [myAvatar, setMyAvatar] = useState({
        avatarSeed: "",
        avatarStyle: "",
      });

  // Listen for changes in the user's avatar data to update the avatar in real-time
  useEffect(() => {
    if (!user?.uid) return;
    const userRef = doc(firestore, USERS, user.uid);
    
    const unsubscribe = onSnapshot(userRef, (userSnap) => { 
        if (userSnap.exists()) {
          const data = userSnap.data();

        setMyAvatar({
        avatarSeed: data.avatarSeed || "",
        avatarStyle: data.avatarStyle || "",
        });
    }

    }, (error) =>{
        console.log("Virhe avatarin haussa:", error.message);
        }
      );
    return unsubscribe;
  }, [user]);    


  return (
    <View style={[styles.container, {paddingTop: fit.top +15 }]}>
      
      <View style={{width:40}}>

      {showBack ? (
      <TouchableOpacity onPress={() =>  navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} />
      </TouchableOpacity>
      ) : showNotifications ? (
        <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>

          <View style={{ position: "relative" }}>
          <Ionicons name="notifications-circle-outline" size={40} />

          {totalNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {totalNotifications > 9 ? "9+" : totalNotifications}
              </Text>
            </View>
          )}
          </View>
        </TouchableOpacity>
      ) : null}
      </View>


      <View style={{flex:1}}/>

      {showProfile && (
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <UserAvatar 
          avatarSeed={myAvatar.avatarSeed} 
          avatarStyle={myAvatar.avatarStyle} 
          size={40} />
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
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4

  },

  badgeText: {
    color: "white", 
    fontSize: 10, 
    fontWeight: "bold" 
  },
});