import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList,Image } from "react-native";
import {  useNavigation } from '@react-navigation/native';
import { firestore, collection, query, onSnapshot, orderBy, doc, getDoc,
    USERS, USERSPRIVATECHATS } from "../firebase/config.js";
import { useUser } from "../context/UserContext.js";
import styles from "../styles/PrivaChats.js";
import Logo from "../../assets/Logo.png";
import UserAvatar from "../components/UserAvatar.js";
import Loading from "../components/Loading.js";




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
    const [chatUsers, setChatUsers] = useState({})
    const user = useUser()
    const [isLoading, setIsLoading] = useState(true);    
    

    useEffect(() => {
        if (!user) return;
        setIsLoading(true);

        const q = query(collection(firestore,USERS,user.uid,USERSPRIVATECHATS),
        orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            
            setAllChats(chatList);
            setIsLoading(false);
        })
        return unsubscribe;
    }, [user])


    useEffect(() => {
            const fetchChatUsers = async () => {
            if (!allChats.length) {
                setChatUsers({});
                return;
            }

            const usersData = {};
            const uniqueUserIds = [
                ...new Set(allChats.map((chat) => chat.otherUser).filter(Boolean)),
            ];

            for (const userId of uniqueUserIds) {
                try {
                const userRef = doc(firestore, USERS, userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();

                    usersData[userId] = {
                    avatarSeed: data.avatarSeed || "",
                    avatarStyle:
                        data.avatarStyle === "fun emoji"
                        ? "fun-emoji"
                        : data.avatarStyle || "fun-emoji",
                    };
                }
                } catch (error) {
                console.log("Virhe käyttäjän avatarin haussa:", error);
                }
            }

            setChatUsers(usersData);
            };

            fetchChatUsers();
        }, [allChats]);
    
    if (isLoading) {
        return <Loading text="Ladataan keskusteluja..." />;
    }

    return (
        
        <View style={styles.container}>
            <Image source={Logo} style={styles.logo} />
        <Text style={styles.title}>Keskustelut</Text>

        <FlatList
        style={{flex: 1}}
        contentContainerStyle={{ paddingBottom: 100 }}
        data={allChats}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={true}
        renderItem={({ item }) => {


            const time = item.updatedAt?.toDate ? item.updatedAt.toDate() : new Date();

            const today = new Date();
            const isToday = time.getDate()=== today.getDate() && time.getMonth() === today.getMonth() && time.getFullYear() === today.getFullYear();

            const formattedTime = isToday ? `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`
                                        : `${time.getDate()}.${(time.getMonth() + 1)}`;

            const avatarInfo = item.otherUser ? chatUsers[item.otherUser] : null;

            const avatarUrl = avatarInfo?.avatarSeed
                ? `https://api.dicebear.com/9.x/${avatarInfo.avatarStyle}/png?seed=${encodeURIComponent(
                    avatarInfo.avatarSeed
                )}`
                : null;

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

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <UserAvatar
                        avatarSeed={avatarInfo?.avatarSeed}
                        avatarStyle={avatarInfo?.avatarStyle}
                        size={50}
                    />
                    
                        <View style={styles.messageContainer}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={styles.messageHeader}>{item.otherUserName}</Text>
                                <Text style={styles.messageTime}>{formattedTime}</Text>
                            </View>

                            <Text style={styles.message} numberOfLines={1}>
                                {item.latestMessage || ""}
                            </Text>
                        </View>
                        
                </View>
                
            </TouchableOpacity>
            )
        }}
      />

        
    </View>

    
    );
}
