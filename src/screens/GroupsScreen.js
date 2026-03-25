import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { useUser } from "../context/UserContext.js";
import styles from "../styles/Home.js";
import {
  firestore,
  collection,
  onSnapshot
} from "../firebase/config";

export default function GroupScreen() {
  const user = useUser(); // Haetaan tällä hetkellä kirjautuneen käyttäjän tiedot
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ryhmäsivu</Text>

      {loading ? (
        <ActivityIndicator size="large" />
        // Näytetään latauspyörä kun dataa haetaan
      ) : groups.length === 0 ? (
        <Text>Et kuulu vielä ryhmiin</Text> // Jos käyttäjä ei kuulu vielä mihinkää ryhmää nii lukee tää
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {item.name}
              </Text>

              <Text style={{ color: "#555" }}>
                {item.description}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}