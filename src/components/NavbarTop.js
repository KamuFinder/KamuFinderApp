import React from "react";
import { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UserAvatar from "./UserAvatar.js";
import { useUser } from "../context/UserContext";
import { firestore, USERS,onSnapshot,doc } from "../firebase/config.js";

export default function NavbarTop({ showBack = false, showProfile = false, showNotifications = false  }) {
    const navigation = useNavigation();
    const fit = useSafeAreaInsets();
    const user= useUser();

    const [myAvatar, setMyAvatar] = useState({
          avatarSeed: "",
          avatarStyle: "",
        });

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
        <TouchableOpacity onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons name="notifications-circle-outline" size={40} />
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
});