import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, } from "react-native";
import {  useNavigation } from '@react-navigation/native';
import { firestore, collection, query, onSnapshot, orderBy, USERS, USERSPRIVATECHATS } from "../firebase/config.js";
import { useUser } from "../context/UserContext.js";
import styles from "../styles/PrivaChats.js";
import { Ionicons } from "@expo/vector-icons";


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
                backgroundColor: item.unReadMessages ? "#cce5ff" : "#f5f5f5"
                }}
                onPress={() =>
                navigation.navigate("SpecificChat", {
                    chatId: item.id,
                    otherUserName: item.otherUserName
                })
                }
            >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "bold" }}>{item.otherUserName}</Text>
                    <Text style={{ color: "#555" }}>{formattedTime}</Text>
                </View>

                <Text numberOfLines={1}>{item.latestMessage || ""}</Text>
            </TouchableOpacity>
            )
        }}
      />
        
    </View>
    );
}
