import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, Image, 
  TouchableOpacity
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext.js";
import { firestore, collection, onSnapshot, getDocs } from "../firebase/config";
import Logo from "../../assets/Logo.png";
import styles from "../styles/Groups.js";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";


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

  const user = useUser(); //Hakee kirjautuneen käyttäjän
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;  // Jos käyttäjää ei ole (uid undefined), älä tee mitään

    const groupsRef = collection(firestore, "groups"); //"groups"-kokoelma Firestoressa

    const unsubscribe = onSnapshot(groupsRef, async (snapshot) => {
      const allGroups = snapshot.docs;
      const userGroups = []; // Lista käyttäjän ryhmistä


      // Käydään jokainen ryhmä läpi
      for (const groupDoc of allGroups) {
        // Haetaan subcollection "members" kyseisestä ryhmästä
        const membersRef = collection(firestore, "groups", groupDoc.id, "members");
        const membersSnapshot = await getDocs(membersRef);

        const isMember = membersSnapshot.docs.some(
          memberDoc => memberDoc.id === user.uid
        );



        // Jos käyttäjä kuuluu ryhmään, lisätään se listalle
        if (isMember) {
          const data = groupDoc.data();
          
          userGroups.push({
            id: groupDoc.id,
            name: data.groupName || "Nimetön ryhmä",
            description: data.desc || "",
            createdAt: data.createdAt
          });
        }
      }

      console.log("User groups:", userGroups); //Tää heittää consolii ryhmän nimen, kuvauksen ja id, demo hommia nii jätin tän viel
      setGroups(userGroups);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return (
    <View style={styles.container}>

      <Image source={Logo} style={styles.logo} />
      <Text style={styles.title}>Omat ryhmäsi:</Text>

      {loading ? (
         // Tää on se latauspyörä efekti ku dataa haetaan
        <ActivityIndicator size="large" />
      ) : groups.length === 0 ? (
        <Text>Et kuulu vielä ryhmiin</Text>     // Jos käyttäjä ei kuulu vielä mihinkää ryhmää nii lukee tää
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.groupItem, 
            { backgroundColor: getGroupColor(item.name) }]}>
              <View>
              <Text style={{ fontSize: 32, fontWeight: "bold",marginBottom:8 }}>
                {item.name}
              </Text>
              {item.description ? (
                <Text style={{ color: "#555",fontSize:16,fontFamily: "monospace" }}>{item.description}</Text>
              ) : null}
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate("SpecificGroupChat", { groupId: item.id})
              }
              >
                <View style={styles.iconMessage}>
                <FontAwesome6 name="message" size={24} color={"#f17a0a"} />
                </View>
                </TouchableOpacity>
              
            </View>
          )}
        />
      )}
    </View>
  );
}