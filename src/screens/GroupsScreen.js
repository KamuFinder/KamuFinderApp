import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext.js";
import {
  firestore,
  collection,
  onSnapshot,
} from "../firebase/config";
import { USERS, FRIENDS } from "../firebase/config";
import Logo from "../../assets/Logo.png";
import styles from "../styles/Groups.js";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import {
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { TextInput } from "react-native";

const groupColors = [
  "#E3F2FD",
  "#FCE4EC",
  "#E8F5E9",
  "#FFF3E0",
  "#F3E5F5",
  "#E0F7FA",
  "#FFF9C4",
];

const getGroupColor = (groupName) => {
  let hash = 0;

  for (let i = 0; i < groupName.length; i++) {
    hash = groupName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return groupColors[Math.abs(hash) % groupColors.length];
};

export default function GroupScreen() {
  const navigation = useNavigation();
  const user = useUser();  // Haetaan tällä hetkellä kirjautuneen käyttäjän tiedot
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // MODAL + KAVERIT
  const [modalVisible, setModalVisible] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  useEffect(() => {
    if (!user?.uid) return; // Jos käyttäjää ei ole (uid undefined), älä tee mitään

    const userGroupsRef = collection(
      firestore,
      "user",
      user.uid,
      "user-groups" //haetaan käyttäjän "user-groups" :)
    );

    const unsubscribe = onSnapshot(userGroupsRef, (snapshot) => {
       // Reaaliaikainen kuuntelija, joka päivittyy, kun käyttäjän ryhmät muuttuvat
      const groupsData = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data.groupName || "Nimetön ryhmä",
          description: data.description || "",
          joined: data.joined?.toDate() || null // Tämän laitoin nyt tähän, kun firestoressa luki mutta menee vain console logiin.
        };
      });

      console.log("User groups:", groupsData); //tämä heittää nyt logii kaikki tiedot mitä saa 

      setGroups(groupsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  //  HAETAAN KAVERIT (otin mallia profiilisivulta)
  useEffect(() => {
    if (!user?.uid) return;

    const friendsRef = collection(
      firestore,
      USERS,
      user.uid,
      FRIENDS
    );

    const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
      const friendsData = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          id: docSnap.id,
          name: `${data.firstName || "Tuntematon"} ${data.lastName || ""}`,
          createdAt: data.timestamp || null,
        };
      });

      setFriendsList(friendsData);
    });

    return unsubscribe;
  }, [user]);

  // Kaverin valinta
  const toggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

 // RYHMÄN LUONTI FIRESTOREEN
const createGroup = async () => {
  try {
    if (!groupName.trim()) {
      Alert.alert("Virhe", "Anna ryhmälle nimi");
      return;
    }

    // Luo ryhmä groups collectioniin
    const groupRef = await addDoc(collection(firestore, "groups"), {
      groupName: groupName,
      desc: groupDescription,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
    });

    const groupId = groupRef.id;

    // Lisätään Group creator automaattisesti jäseneksi
    const allMembers = [...selectedFriends, user.uid];

    // Lisätään members subcollection
    for (const memberId of allMembers) {

      //  määritetää rooli,  jos memberId on ryhmän luoja (user.uid) : admin ja muuten member
      const role = memberId === user.uid ? "admin" : "member";

      await setDoc(
        doc(firestore, "groups", groupId, "members", memberId),
        {
          joinedAt: serverTimestamp(),
          role: role, //groups->groupId->members->memberId-> rooli admin/member
        }
      );

      // Lisätään user -> user-groups 
      await setDoc(
        doc(
          firestore,
          "user",
          memberId,
          "user-groups",
          groupId
        ),
        {
          groupName: groupName,
          description: groupDescription,
          joined: serverTimestamp(),
          role: role, // Myös tänne tulee nyt sit tuo rooli nii säästää firestore queryja myöhemmin
        }
      );
    }

    Alert.alert("Valmis", "Ryhmä luotu!");

    // reset UI
    setModalVisible(false);
    setSelectedFriends([]);
    setGroupName("");
    setGroupDescription("");

  } catch (error) { //Jos luontivaiheessa tulee joku virhe nii error handling
    console.log("Group creation error:", error);
    Alert.alert("Virhe", "Ryhmän luonti epäonnistui");
  }
};

  return (
    <View style={styles.container}>

      <Image source={Logo} style={styles.logo} />
      <Text style={styles.title}>Omat ryhmäsi:</Text>

      {/* LUO RYHMÄ NAPPI */}
      <TouchableOpacity
        style={{
          backgroundColor: "#f17a0a",
          padding: 12,
          borderRadius: 8,
          alignSelf: "flex-start",
          marginBottom: 16,
        }}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Luo ryhmä
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" />
        // Näytetään latauspyörä kun dataa haetaan
      ) : groups.length === 0 ? (
        <Text>Et kuulu vielä ryhmiin</Text> // Jos käyttäjä ei kuulu vielä mihinkää ryhmää nii lukee tää
      ) : (
        <FlatList
          data={groups}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={true}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[
              styles.groupItem,
              { backgroundColor: getGroupColor(item.name) }
            ]}>
              <View>
                <Text style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  marginBottom: 8
                }}>
                  {item.name}
                </Text>

                {item.description ? (
                  <Text style={{
                    color: "#555",
                    fontSize: 16,
                    fontFamily: "monospace"
                  }}>
                    {item.description}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("SpecificGroupChat", {
                    groupId: item.id
                  })
                }
              >
                <View style={styles.iconMessage}>
                  <FontAwesome6
                    name="message"
                    size={24}
                    color={"#f17a0a"}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

     {/* MODAL — KAVERILISTA Tässä*/}
<Modal
  visible={modalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>

  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
    <TextInput
  placeholder="Ryhmän nimi"
  value={groupName}
  onChangeText={setGroupName}
  style={{
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  }}
/>

<TextInput
  placeholder="Ryhmän kuvaus"
  value={groupDescription}
  onChangeText={setGroupDescription}
  style={{
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  }}
/>
      <Text style={{
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16
      }}>
        Valitse kaverit ryhmään
      </Text>

      {friendsList.length === 0 ? (
        <Text>Sinulla ei ole vielä kavereita</Text>
      ) : (
        <FlatList
          data={friendsList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const selected = selectedFriends.includes(item.id);

            return (
              <TouchableOpacity
                onPress={() => toggleFriend(item.id)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontSize: 16 }}>
                  {item.name}
                </Text>

                <Ionicons
                  name={
                    selected
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                  color="#f17a0a"
                />
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity
        style={{
          marginTop: 20,
          backgroundColor: "#f17a0a",
          padding: 12,
          borderRadius: 8,
        }}
        onPress={createGroup}
      >
        <Text style={{
          textAlign: "center",
          color: "white",
          fontWeight: "bold"
        }}>
          Luo ryhmä
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setModalVisible(false)}
        style={{ marginTop: 10 }}
      >
        <Text style={{
          textAlign: "center",
          color: "#f17a0a"
        }}>
          Sulje
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
  );
}