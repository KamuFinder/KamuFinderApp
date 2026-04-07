import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useUser } from "../context/UserContext.js";
import {
  firestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  USERS,
} from "../firebase/config.js";
import DateDivider from "../components/dateDivider.js";
import UserAvatar from "../components/UserAvatar.js";
import Divider from "../components/Divider.js";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {SvgUri} from 'react-native-svg';

export default function SpecificGroupChat() {
  const route = useRoute();
  const user = useUser();

  const { groupId, groupName } = route.params;

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [userData, setUserData] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);
  const [groupData, setGroupData] = useState(null); 
  const [members, setMembers] = useState([]);
  const [membersModalVisible, setMembersModalVisible] = useState(false);

  const getGroupAvatarUrl = (seed, style, name = "Group", size = 60) => {
  if (!seed || !style) return null;

  const params = new URLSearchParams({
    email: seed,
    name,
    v: String(style),
    size: String(size),
  });

  return `https://classyprofile.com/api/avatar?${params.toString()}`;
};
  
  
  // Haetaan nykyisen käyttäjän tiedot
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(firestore, USERS, user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      } catch (error) {
        console.log("Virhe käyttäjän tietojen haussa:", error);
      }
    };

    fetchUserData();
  }, [user]);
 
  // Haetaan ryhmän jäsenten tiedot viestien lähettäjistä
  useEffect(() => {
  if (!messages.length) return;

  const fetchUsers = async () => {
    const usersData = {};

    const uniqueUserIds = [
      ...new Set(messages.map((msg) => msg.senderId).filter(Boolean)),
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
        console.log("Error fetching user avatar:", error.message);
      }
    }

    setChatUsers(usersData);
  };

  fetchUsers();
}, [messages]);

  // Haetaan ryhmän viestit reaaliaikaisesti
  useEffect(() => {
    if (!groupId) return;

    const q = query(
      collection(firestore, "groups", groupId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setMessages(messagesData);
    });

    return unsubscribe;
  }, [groupId]);

  // Haetaan ryhmän jäsenet
  useEffect(() => {
  if (!groupId) return;

  const unsubscribeGroup = onSnapshot(
    doc(firestore, "groups", groupId),
    (docSnap) => {
      if (docSnap.exists()) {
        setGroupData(docSnap.data());
      }
    }
  );

 

  const unsubscribeMembers = onSnapshot(
    collection(firestore, "groups", groupId, "members"),
    async (snapshot) => {
      const membersData = await Promise.all(
        snapshot.docs.map(async (memberDoc) => {
          const memberId = memberDoc.id;
          const memberInfo = memberDoc.data();

          try {
            const userRef = doc(firestore, USERS, memberId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();

              return {
                id: memberId,
                role: memberInfo.role || "member",
                name: `${userData.firstName || "Tuntematon"} ${userData.lastName || ""}`.trim(),
                avatarSeed: userData.avatarSeed || "",
                avatarStyle:
                  userData.avatarStyle === "fun emoji"
                    ? "fun-emoji"
                    : userData.avatarStyle || "fun-emoji",
              };
            }

            return {
              id: memberId,
              role: memberInfo.role || "member",
              name: "Tuntematon käyttäjä",
              avatarSeed: "",
              avatarStyle: "fun-emoji",
            };
          } catch (error) {
            console.log("Virhe jäsenen haussa:", error);
            return {
              id: memberId,
              role: memberInfo.role || "member",
              name: "Tuntematon käyttäjä",
              avatarSeed: "",
              avatarStyle: "fun-emoji",
            };
          }
        })
      );

      setMembers(membersData);
    }
  );

  return () => {
    unsubscribeGroup();
    unsubscribeMembers();
  };
}, [groupId]);

  const sendMessage = async () => {
    if (!messageText.trim() || !user?.uid) return;

    try {
      const senderName =
        userData?.firstName && userData?.lastName
          ? `${userData.firstName} ${userData.lastName}`
          : userData?.firstName || "Tuntematon käyttäjä";

      await addDoc(collection(firestore, "groups", groupId, "messages"), {
        text: messageText.trim(),
        senderId: user.uid,
        senderName: senderName,
        avatarSeed: userData?.avatarSeed || "",
        avatarStyle: userData?.avatarStyle || "",
        createdAt: serverTimestamp(),
      });

      // Halutessa päivitetään ryhmän viimeisin viesti myös group-documenttiin
      // Tätä voi käyttää myöhemmin ryhmälistassa preview-tekstinä

      setMessageText("");
    } catch (error) {
      console.log("Virhe viestin lähetyksessä:", error);
    }
  };

  const renderMessage = ({ item }) => {
    const avatarInfo = chatUsers[item.senderId];

    const avatarSeed = avatarInfo?.avatarSeed || item.avatarSeed;
    const avatarStyle = avatarInfo?.avatarStyle || item.avatarStyle || "";
    const isOwnMessage = item.senderId === user?.uid;

    const time = item.createdAt?.toDate ? item.createdAt.toDate() : null;
    
    const formattedTime = time
      ? `${time.getHours().toString().padStart(2, "0")}:${time
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      : "";

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          alignSelf: isOwnMessage ? "flex-end" : "flex-start",
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginBottom: 10,
          maxWidth: "80%",
        }}
      >

         {/* AVATAR VAIN MUILLE */}
          {!isOwnMessage && (
            <View style={{marginRight: 8}}>
            <UserAvatar
              avatarSeed={avatarSeed}
              avatarStyle={avatarStyle}
              size={30}
            />
            </View>
          )}

       {/* VIESTIKUPLA */}
      <View
        style={{
          backgroundColor: isOwnMessage ? "#f17a0a" : "#e5e5ea",
          borderBottomRightRadius: isOwnMessage ? 2 : 12,
          borderBottomLeftRadius: !isOwnMessage ? 2 : 12,
          paddingHorizontal: 15,
          paddingVertical: 10,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 14,
          maxWidth: "80%",
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            marginBottom: 4,
            color: isOwnMessage ? "white" : "#333",
            fontSize: 14,
          }}
        >
          {isOwnMessage ? "Sinä" : item.senderName || "Tuntematon"}
        </Text>

        <Text
          style={{
            color: isOwnMessage ? "white" : "black",
            fontSize: 16,
            paddingRight: 42,
          }}
        >
          {item.text}
        </Text>

        <Text
          style={{
            fontSize: 11,
            color: isOwnMessage ? "#ffe7cf" : "#666",
            position: "absolute",
            right: 10,
            bottom: 8,
          }}
        >
          {formattedTime}
        </Text>
      </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={20}
    >

      <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 30,
          paddingTop: 20,
          marginBottom: 16,
        }}
      >

       {/* AVATAR */}
  {(groupData?.avatarSeed && groupData?.avatarStyle) ? (
    <View
      style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: "hidden",
        backgroundColor: "#ddd",
        marginRight: 12,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SvgUri
        uri={getGroupAvatarUrl(
          groupData.avatarSeed,
          groupData.avatarStyle,
          groupData.groupName || groupName || "Group",
          50
        )}
        width={50}
        height={50}
      />
    </View>
  ) : null}
      

      <Text
        style={{
          textAlign: "flex-start",
          fontSize: 32,
          paddingHorizontal: 20,
          paddingTop: 20,
          fontWeight: "bold",
          marginBottom: 16,
          
        }}
      >
        {groupName || "Ryhmäkeskustelu"}
      </Text>
      </View>

       <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          paddingHorizontal: 40,
          marginBottom: 16,
          gap: 8,
        }}
      >

        <TouchableOpacity onPress={() => setMembersModalVisible(true)}>
         <FontAwesome6 name="crown" size={20} color="black" />
        </TouchableOpacity>

        <Text style={{ color: "#444", fontSize: 14 }}>
           {members.length}
        </Text>

      </View>

          {groupData?.desc ? (
        <Text
          style={{
            textAlign: "flex-start",
            color: "#666",
            marginBottom: 8,
            paddingHorizontal: 40,
          }}
        >
          {groupData.desc}
        </Text>
      ) : null}

     <Divider thickness={2} color="#b6afaf" width="80%" />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={true}
        renderItem={({ item, index }) => {
          const time = item.createdAt?.toDate ? item.createdAt.toDate() : new Date();

          const previousItem = index > 0 ? messages[index - 1] : null;
          const previousTime = previousItem?.createdAt?.toDate
            ? previousItem.createdAt.toDate()
            : null;

          const isNewDay =
            !previousTime ||
            time.getDate() !== previousTime.getDate() ||
            time.getMonth() !== previousTime.getMonth() ||
            time.getFullYear() !== previousTime.getFullYear();

          return (
            <>
              {isNewDay && <DateDivider date={time} />}
              {renderMessage({ item })}
            </>
          );
        }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 10,
          padding: 10,
          marginBottom: 50,
          borderTopWidth: 1,
          borderTopColor: "#ccc",
        }}
      >
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Kirjoita viesti..."
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 20,
            paddingHorizontal: 15,
            paddingVertical: 10,
            marginRight: 10,
          }}
        />

        <TouchableOpacity
          onPress={sendMessage}
          style={{
            backgroundColor: "#007bff",
            paddingHorizontal: 15,
            paddingVertical: 12,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Lähetä</Text>
        </TouchableOpacity> 


        <Modal
          visible={membersModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setMembersModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 20,
                maxHeight: "70%",
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                Ryhmän jäsenet
              </Text>

              <FlatList
                data={members}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: "#eee",
                    }}
                  >
                    <UserAvatar
                      avatarSeed={item.avatarSeed}
                      avatarStyle={item.avatarStyle}
                      size={42}
                    />

                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: "600" }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#666" }}>
                        {item.role === "admin" ? "Admin" : "Jäsen"}
                      </Text>
                    </View>
                  </View>
                )}
              />

              <TouchableOpacity
                onPress={() => setMembersModalVisible(false)}
                style={{
                  marginTop: 16,
                  backgroundColor: "#f17a0a",
                  padding: 12,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Sulje
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </KeyboardAvoidingView>
  );
}