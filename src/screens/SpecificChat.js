import React, { useRef, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, 
  KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext.js";
import { firestore, collection, query, onSnapshot, orderBy,
  addDoc, serverTimestamp, PRIVATECHATS, MESSAGES, getDoc, 
  USERS, USERSPRIVATECHATS } from "../firebase/config.js";
import { doc, updateDoc, getDocs,  limit, startAfter} from "firebase/firestore";
import styles from "../styles/SpecificChat.js";
import DateDivider from "../components/dateDivider.js";
import UserAvatar from "../components/UserAvatar.js";
import Loading from "../components/Loading.js";

export default function HomeScreen() {
  const user = useUser()
  const navigation = useNavigation()
  const route = useRoute();
  const { chatId, otherUserName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserId, setOtherUserId] = useState(null);

  const emptyAvatar = {
    avatarSeed: "",
    avatarStyle: "",
  };
  
  const [otherUserAvatar, setOtherUserAvatar] = useState(emptyAvatar);
  const [myAvatar, setMyAvatar] = useState(emptyAvatar);

  const flatListRef = useRef(null);

  const [initialLoad, setInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)


  useEffect(() => {
    if (!user || !chatId) return;

    
    const fetchChatInfo = async () => {
      try{
        const chatRef = doc(firestore, PRIVATECHATS, chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
          const data = chatSnap.data();
          setOtherUserId(data.user1 === user.uid ? data.user2 : data.user1);
        }
        }catch (error) {
        console.log("Error in getting chat info", error.message);
        }
      }
    
    fetchChatInfo()
  }, [chatId, user,]);


  useEffect(() => {
    if (!otherUserId) return;

        const fetchOtherUserAvatar = async () => {
          try {
            const userRef = doc(firestore, USERS, otherUserId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const data = userSnap.data();

              setOtherUserAvatar({
                avatarSeed: data.avatarSeed || "",
                avatarStyle:
                  data.avatarStyle === "fun emoji"
                    ? "fun-emoji"
                    : data.avatarStyle || "fun-emoji",
              });
            }
          } catch (error) {
            console.log("Error in getting other user avatar", error.message);
          }
        };

        fetchOtherUserAvatar();
      }, [otherUserId]);




  useEffect(() => {
  if (!user) return;

      const fetchMyAvatar = async () => {
        try {
          const userRef = doc(firestore, USERS, user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();

            setMyAvatar({
              avatarSeed: data.avatarSeed || "",
              avatarStyle:
                data.avatarStyle === "fun emoji"
                  ? "fun-emoji"
                  : data.avatarStyle || "fun-emoji",
            });
          }
        } catch (error) {
          console.log("Error fetching my avatar:", error.message);
        }
      };

      fetchMyAvatar();
    }, [user]);




    useEffect(() => {
    if (!user || !chatId) return;

    const messagesRef = collection(firestore, PRIVATECHATS, chatId, MESSAGES)
    const q = query(messagesRef, orderBy("timestamp", "desc"), limit(20))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const docs = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
            const tb = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
            return tb - ta; 
          })

        setMessages((prev) => {
          const prevMap = new Map(prev.map((m) => [m.id, m]));
          const merged = [];

          for (const doc of docs) {
            merged.push(doc)
            prevMap.delete(doc.id)
          }
          for (const [, v] of prevMap) {
            merged.push(v)
          }
          return merged
        });

        if (snapshot.docs.length > 0) {
          const lastDoc = snapshot.docs[snapshot.docs.length - 1]
          setLastVisibleDoc((prev) => prev || lastDoc)
        }

        setIsLoading(false)

        try {
          const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
          if (msgs.length > 0) {
            const lastMessage = msgs[0]
            if (lastMessage && lastMessage.userId !== user.uid) {
              const chatRef = doc(firestore, USERS, user.uid, USERSPRIVATECHATS, chatId)
              await updateDoc(chatRef, { unReadMessages: false })
            }
          }
        } catch (error) {
          console.log("Mark as read failed:", error.message)
        }
      },
      (error) => {
        console.log("onSnapshot error:", error.message)
        setIsLoading(false)
      }
    );

    return () => unsubscribe()
  }, [chatId, user]);


  const loadMore = async () => {
    if (!chatId || loadingMore || !hasMore || !lastVisibleDoc) return;
    setLoadingMore(true);

    try {
      const messagesRef = collection(firestore, PRIVATECHATS, chatId, MESSAGES)
      const moreQuery = query(
        messagesRef,
        orderBy("timestamp", "desc"),
        startAfter(lastVisibleDoc),
        limit(20)
      );

      const snap = await getDocs(moreQuery)
      if (!snap.empty) {
        const moreDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setMessages((prev) => {

          const existingIds = new Set(prev.map((m) => m.id))
          const filtered = moreDocs.filter((m) => !existingIds.has(m.id))
          return [...prev, ...filtered]
        });

        setLastVisibleDoc(snap.docs[snap.docs.length - 1])

        if (snap.docs.length < 20) setHasMore(false)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.log("Load more error:", error.message)
    } finally {
      setLoadingMore(false)
    }
  }

  const sendMessage = async () => {
    if (newMessage.trim() === "" || !otherUserId) return;

    try{
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

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 50);

    } catch (error) {
      console.log("Send message error:", error.message)
    }
  }
  
  if (isLoading) {
    return <Loading text="Ladataan viestejä..."/>;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={40}
    >
    <View style={styles.container}>
      <TouchableOpacity 
          onPress={() =>
            navigation.navigate("Profile", {
              userId: otherUserId,
            })
          }
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            justifyContent: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#bcb8b8",

          }}
        >
          <UserAvatar
            avatarSeed={otherUserAvatar.avatarSeed}
            avatarStyle={otherUserAvatar.avatarStyle}
            size={40}
          />
          <Text style={styles.title}>{otherUserName}</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        style={{ flex: 1,  }}
        data={messages}
        inverted= {true}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10}}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: 10 }}>
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }

          onContentSizeChange={() => {
            if (initialLoad) {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: false })
              setInitialLoad(false);
            }
          }}

        renderItem={({ item, index }) => {
          const isMe = item.userId === user.uid;
          const time = item.timestamp?.toDate ? item.timestamp.toDate() : new Date()

          const  nextItem = index < messages.length -1 ? messages[index +1] : null
          const nextTime = nextItem?.timestamp?.toDate
            ? nextItem.timestamp.toDate()
            : null;

          const isNewDay =
            !nextTime ||
            time.getDate() !== nextTime.getDate() ||
            time.getMonth() !== nextTime.getMonth() ||
            time.getFullYear() !== nextTime.getFullYear();

          const formattedTime = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
        
          return (
            <View key={item.id}>
            {isNewDay && <DateDivider date={time} />}

            <View
              style={{
                flexDirection: isMe ? "row-reverse" : "row",
                alignItems: "flex-end",
                marginBottom: 10,}}
                >
                {!isMe && (
                  <View 
                  style={{ 
                    marginRight: 8, alignSelf: "center",
                    borderWidth: 1, borderColor: "#0c0c0d",
                    borderRadius: 25, padding: 2}}>
                    <UserAvatar
                      avatarSeed={otherUserAvatar.avatarSeed}
                      avatarStyle={otherUserAvatar.avatarStyle}
                      size={30}
                    />
                  </View>
                )}

                 {isMe && (
                    <View 
                    style={{ 
                      marginLeft: 8, alignSelf: "center", 
                      borderWidth: 1, borderColor: "#0c0c0d", 
                      borderRadius: 25, padding: 2,}}>
                      <UserAvatar
                        avatarSeed={myAvatar.avatarSeed}
                        avatarStyle={myAvatar.avatarStyle}
                        size={30}
                      />
                    </View>
                  )}
            
            <View style={[
              styles.messageContainer,
              isMe ? styles.myMessage : styles.otherMessage,
            ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageTime}>{formattedTime}</Text>
            </View>
            </View>

            </View>
          );
  
        }}

        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={{ fontSize: 16, color: "#888" }}>
              Ei vielä yhtään viestejä
            </Text>
          </View>
        }
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