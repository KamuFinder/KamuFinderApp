import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  firestore,
  auth,
  USERS,
  collection,
  addDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "../firebase/config";


const BACKEND_URL = "https://kamufinder-backend.onrender.com";

export default function AIChatScreen() {
  const user = auth.currentUser;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const chatId = "default";

  // Refs Firestoreen
  const chatRef = user
    ? doc(firestore, USERS, user.uid, "ai_chats", chatId)
    : null;

  const messagesRef = user
    ? collection(firestore, USERS, user.uid, "ai_chats", chatId, "messages")
    : null;

  // Kuunnellaan viestejä
  useEffect(() => {
    if (!user || !messagesRef) return;

    // luodaan chat jos sitä ei ole olemassa
    const initChat = async () => {
      await setDoc(
        chatRef,
        {
          title: "AI Chat",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    };

    initChat();

    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(list);
    });

    return () => unsubscribe();
  }, [user]);

  // Lähetä viesti
  const sendMessage = async () => {
    const trimmed = input.trim();

    if (!trimmed) return;
    if (!user || !messagesRef) return;
    if (sending) return;

    setSending(true);
    setInput("");

    try {
      // 1. tallenna user viesti
      await addDoc(messagesRef, {
        role: "user",
        text: trimmed,
        createdAt: serverTimestamp(),
      });

      // 2. kutsu backend
      const res = await fetch(`${BACKEND_URL}/chat/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          chatId,
          message: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "AI error");
      }

      // 3. tallenna AI:n vastaus
      await addDoc(messagesRef, {
        role: "assistant",
        text: data.reply,
        createdAt: serverTimestamp(),
      });

      // 4. päivitä chat timestamp
      await setDoc(
        chatRef,
        {
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      Alert.alert("Virhe", err.message || "Jokin meni pieleen");
    } finally {
      setSending(false);
    }
  };

  // Render viesti
  const renderItem = ({ item }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.message,
          isUser ? styles.userMessage : styles.aiMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Kirjaudu sisään käyttääksesi chatia</Text>
      </View>
    );
  }

  return (
  <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
    >

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Kirjoita viesti..."
          value={input}
          onChangeText={setInput}
          editable={!sending}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff" }}>Lähetä</Text>
          )}
        </TouchableOpacity>
      </View>
        </KeyboardAvoidingView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "#1f6feb",
    alignSelf: "flex-end",
  },
  aiMessage: {
    backgroundColor: "#e5e5e5",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#000",
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#1f6feb",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});