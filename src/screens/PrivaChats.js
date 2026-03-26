import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList,Image } from "react-native";
import {  useNavigation } from '@react-navigation/native';
import { firestore, collection, query, onSnapshot, orderBy, USERS, USERSPRIVATECHATS } from "../firebase/config.js";
import { useUser } from "../context/UserContext.js";
import styles from "../styles/PrivaChats.js";
import { Ionicons } from "@expo/vector-icons";
import Logo from "../../assets/Logo.png";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";


const chatColors = [
  "#E3F2FD",
  "#FCE4EC",
  "#E8F5E9",
  "#FFF3E0",
  "#F3E5F5",
  "#E0F7FA",
  "#FFF9C4",
];

const getChatColor = (text) => {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  return chatColors[Math.abs(hash) % chatColors.length];
};

export default function PrivaChats() {
    const navigation = useNavigation()
    const [allChats, setAllChats] = useState([])
    const user = useUser()
    
    

    useEffect(() => {
        if (!user) return;

        const q = query(collection(firestore,USERS,user.uid,USERSPRIVATECHATS),
        orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            
            setAllChats(chatList);
        })
        return unsubscribe;
    }, [user])
    


    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.logo} />
        <Text style={styles.title}>Keskustelut</Text>

        <FlatList
        data={allChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {


            const time = item.updatedAt?.toDate ? item.updatedAt.toDate() : new Date();

            const today = new Date();
            const isToday = time.getDate()=== today.getDate() && time.getMonth() === today.getMonth() && time.getFullYear() === today.getFullYear();

            const formattedTime = isToday ? `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`
                                        : `${time.getDate()}.${(time.getMonth() + 1)}`;

            return (
                <TouchableOpacity
                style={{
                padding: 15,
                marginBottom: 10,
                borderRadius: 10,
                borderWidth: item.unReadMessages ? 2 : 0,
                borderColor:"#f53232", 
                backgroundColor:getChatColor (item.otherUserName || item.id),
                }}
                onPress={() =>
                navigation.navigate("SpecificChat", {
                    chatId: item.id,
                    otherUserName: item.otherUserName
                })
                }
            >
                
                    <View style={styles.messageContainer}>
                        <Text style={styles.messageHeader}>{item.otherUserName}</Text>
                        <Text style={styles.messageTime}>{formattedTime}</Text>
                    </View>

                    <Text style={styles.message} numberOfLines={1}>
                        {item.latestMessage || ""}
                    </Text>
                
            </TouchableOpacity>
            )
        }}
      />
        
    </View>
    );
}
