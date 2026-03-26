import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, 
  KeyboardAvoidingView, Platform } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useUser } from "../context/UserContext.js";
import { firestore, collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, PRIVATECHATS, MESSAGES, getDoc, USERS, USERSPRIVATECHATS } from "../firebase/config.js";
import { doc, updateDoc } from "firebase/firestore";
import {  useNavigation } from '@react-navigation/native';
import styles from "../styles/SpecificChat.js";
import DateDivider from "../components/dateDivider.js";

export default function HomeScreen() {
  const user = useUser()
  const navigation = useNavigation()
  const route = useRoute();
  const { chatId, otherUserName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserId, setOtherUserId] = useState(null);
  


  useEffect(() => {
    if (!user || !chatId) return;

    try{
      const messagesRef = collection(firestore, PRIVATECHATS, chatId, MESSAGES);
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
      });

      return unsubscribe;
    } catch (error) {
        console.log("No messages awailable", error.message)
        setMessages([])
    }
  }, [chatId, user]);

  useEffect(() =>{
    if (!user || !chatId) return;

    const fetchChatInfo = async () => {
      try{
        const chatRef = doc(firestore, PRIVATECHATS, chatId)
        const chatSnap = await getDoc(chatRef)

        if(chatSnap.exists()) {
          const data = chatSnap.data()

          if(data.user1 === user.uid) {
            setOtherUserId(data.user2)
          } 
          else {
            setOtherUserId(data.user1)
          }
        }
      
      
      } catch (error) {
        console.log("Error in getting chat info", error.message)
      }
    }
    fetchChatInfo()

  }, [user, chatId])

  useEffect(() => {
    if (!user || !chatId || messages.length === 0) return;

    const markAsRead = async () => {

      try {
        const lastMessage = messages[messages.length - 1]

        if (lastMessage.userId === user.uid) return;

        const chatRef = doc(firestore,USERS, user.uid, USERSPRIVATECHATS,chatId)
        await updateDoc (chatRef, {
          unReadMessages: false,
        })
      } catch (error) {
        console.log("Error in marking message as read", error.message)
      }
    }
    markAsRead()
  }, [messages])



  const sendMessage = async () => {
    if (newMessage.trim() === "" || !otherUserId) return;

    const messageRef = collection(firestore, PRIVATECHATS, chatId, MESSAGES)
    await addDoc (messageRef, {
      text: newMessage,
      userId: user.uid,
      timestamp: serverTimestamp(),
    })

    const myChatRef = doc(firestore, USERS, user.uid, USERSPRIVATECHATS, chatId)
    await updateDoc(myChatRef, {
      latestMessage: newMessage,
      updatedAt: serverTimestamp()
    })


    const otherChatRef = doc(firestore, USERS, otherUserId, USERSPRIVATECHATS, chatId)
    await updateDoc(otherChatRef, {
      latestMessage: newMessage,
      updatedAt: serverTimestamp(),
      unReadMessages: true,
    })

    setNewMessage("");
  }
  

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={40}
    >
    <View style={styles.container}>
      <Text style={styles.title}>{otherUserName}</Text>


      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
        renderItem={({ item, index }) => {
          const isMe = item.userId === user.uid;
          const time = item.timestamp?.toDate ? item.timestamp.toDate() : new Date();

          const previousItem = index > 0 ? messages[index - 1] : null;
          const previousTime = previousItem?.timestamp?.toDate
            ? previousItem.timestamp.toDate()
            : null;

          const isNewDay =
            !previousTime ||
            time.getDate() !== previousTime.getDate() ||
            time.getMonth() !== previousTime.getMonth() ||
            time.getFullYear() !== previousTime.getFullYear();

          const formattedTime = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
        
          return (
            <>
              {isNewDay && <DateDivider date={time} />}

            <View
              //key={item.id}
              style={[
                styles.messageContainer,
                isMe ? styles.myMessage : styles.otherMessage
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageTime}>{formattedTime}</Text>
            </View>
            </>
          );
  
        }}

      
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Kirjoita viesti..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Lähetä</Text>
        </TouchableOpacity>
      </View>


      
    </View>
    </KeyboardAvoidingView>
  );
}
