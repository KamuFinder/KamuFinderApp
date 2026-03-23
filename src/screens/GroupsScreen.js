import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { useUser } from "../context/UserContext.js";
import styles from "../styles/Home.js";
import { firestore, collection, onSnapshot, getDocs } from "../firebase/config";

export default function GroupScreen() {
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
      <Text style={styles.title}>Ryhmäsivu</Text>

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
            <View style={{ paddingVertical: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {item.name}
              </Text>
              {item.description ? (
                <Text style={{ color: "#555" }}>{item.description}</Text>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}