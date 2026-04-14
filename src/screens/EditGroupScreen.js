import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useUser } from "../context/UserContext.js";
import UserAvatar from "../components/UserAvatar.js";
import Divider from "../components/Divider.js";
import GroupAvatarPicker from "../components/GroupAvatarPicker.js";
import styles from "../styles/EditGroup.js";

import {
  firestore,
  USERS,
  FRIENDS,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "../firebase/config.js";

import { collection, getDocs, addDoc } from "firebase/firestore";

export default function EditGroupScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const user = useUser();

  const { groupId, isAdmin } = route.params;

  const [groupData, setGroupData] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [avatarStyle, setAvatarStyle] = useState("1");

  const [members, setMembers] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [membersModalVisible, setMembersModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchGroupData = async () => {
    try {
      const groupRef = doc(firestore, "groups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        Alert.alert("Virhe", "Ryhmää ei löytynyt.");
        navigation.goBack();
        return;
      }

      const data = groupSnap.data();

      setGroupData(data);
      setGroupName(data.groupName || "");
      setDescription(data.desc || "");
      setAvatarSeed(data.avatarSeed || "");
      setAvatarStyle(
        data.avatarStyle || "1"
      );
    } catch (error) {
      console.log("Virhe ryhmän tietojen haussa:", error);
      Alert.alert("Virhe", "Ryhmän tietojen haku epäonnistui.");
    }
  };

  const fetchMembers = async () => {
    try {
      const membersRef = collection(firestore, "groups", groupId, "members");
      const membersSnap = await getDocs(membersRef);

      const membersData = await Promise.all(
        membersSnap.docs.map(async (memberDoc) => {
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
    } catch (error) {
      console.log("Virhe jäsenten haussa:", error);
      Alert.alert("Virhe", "Jäsenten haku epäonnistui.");
    }
  };

  const fetchFriends = async () => {
    if (!user?.uid) return;

    try {
      const friendsRef = collection(firestore, USERS, user.uid, FRIENDS);
      const friendsSnap = await getDocs(friendsRef);

      const existingMemberIds = new Set(members.map((member) => member.id));

      const friendsData = await Promise.all(
        friendsSnap.docs.map(async (friendDoc) => {
          const friendId = friendDoc.id;

          try {
            const userRef = doc(firestore, USERS, friendId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) return null;

            const userData = userSnap.data();

            return {
              id: friendId,
              name: `${userData.firstName || "Tuntematon"} ${userData.lastName || ""}`.trim(),
              avatarSeed: userData.avatarSeed || "",
              avatarStyle:
                userData.avatarStyle === "fun emoji"
                  ? "fun-emoji"
                  : userData.avatarStyle || "fun-emoji",
              alreadyMember: existingMemberIds.has(friendId),
            };
          } catch (error) {
            console.log("Virhe kaverin haussa:", error);
            return null;
          }
        })
      );

      setFriendsList(friendsData.filter(Boolean));
    } catch (error) {
      console.log("Virhe kaverilistan haussa:", error);
      Alert.alert("Virhe", "Kaverilistan haku epäonnistui.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchGroupData();
      await fetchMembers();
      setLoading(false);
    };

    loadData();
  }, [groupId]);

  useEffect(() => {
    if (!loading) {
      fetchFriends();
    }
  }, [loading, members.length]);

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Virhe", "Ryhmän nimi ei voi olla tyhjä.");
      return;
    }

    try {
      setSaving(true);

      const groupRef = doc(firestore, "groups", groupId);

      await updateDoc(groupRef, {
        groupName: groupName.trim(),
        desc: description.trim(),
        avatarSeed: avatarSeed || "",
        avatarStyle: avatarStyle || "1",
      });

       for (const member of members) {
      const userGroupRef = doc(
        firestore,
        "user",
        member.id,
        "user-groups",
        groupId
      );

      await setDoc(
        userGroupRef,
        {
          groupName: groupName.trim(),
          description: description.trim(),
          avatarSeed: avatarSeed || "",
          avatarStyle: avatarStyle || "1",
        },
        { merge: true }
      );
    }

      Alert.alert("Onnistui", "Ryhmän tiedot päivitetty.");
    } catch (error) {
      console.log("Virhe ryhmän tallennuksessa:", error);
      Alert.alert("Virhe", "Ryhmän tietojen tallennus epäonnistui.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSelectedMembers = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert("Huom", "Valitse vähintään yksi käyttäjä.");
      return;
    }

    try {
        const currentGroupName = groupName.trim() || groupData?.groupName || "Nimetön ryhmä";
        const currentDescription = description.trim() || groupData?.desc || "";

      for (const friendId of selectedFriends) {
        // 1. Lisää jäsen ryhmän members-subcollectioniin
        const memberRef = doc(firestore, "groups", groupId, "members", friendId);

        await setDoc(
          memberRef,
          {
            role: "member",
            addedAt: serverTimestamp(),
            addedBy: user.uid,
          },
          { merge: true }
        );
      
       // 2. Lisää ryhmä myös käyttäjän omaan user-groups-listaan
      const userGroupRef = doc(
        firestore,
        "user",
        friendId,
        "user-groups",
        groupId
      );

      await setDoc(
        userGroupRef,
        {
          groupName: currentGroupName,
          description: currentDescription,
          joined: serverTimestamp(),
          role: "member",
          avatarSeed: avatarSeed || groupData?.avatarSeed || "",
          avatarStyle: avatarStyle || groupData?.avatarStyle || "1",
        },
        { merge: true }
      );

      // 3. Luo ilmoitus käyttäjälle
      await addDoc(
        collection(firestore, USERS, friendId, "notifications"),
        {
          type: "group_add",
          message: `Sinut lisättiin ryhmään ${currentGroupName}`,
          groupId: groupId,
          groupName: currentGroupName,
          screen: "SpecificGroupChat",
          fromUserId: user.uid,
          read: false,
          timestamp: serverTimestamp(),
        }
      );
    }

      Alert.alert("Onnistui", "Jäsenet lisätty ryhmään.");
      setSelectedFriends([]);
      setMembersModalVisible(false);

      await fetchMembers();
      await fetchFriends();
    } catch (error) {
      console.log("Virhe jäsenten lisäyksessä:", error);
      Alert.alert("Virhe", "Jäsenten lisääminen epäonnistui.");
    }
  };


  const handleRemoveMember = (member) => {
        if (member.id === user?.uid) {
            Alert.alert("Et voi poistaa itseäsi ryhmästä.");
            return;
        }

        Alert.alert(
            "Poista jäsen",
            `Haluatko varmasti poistaa käyttäjän ${member.name} ryhmästä?`,
            [
            { text: "Peruuta", style: "cancel" },
            {
                text: "Poista",
                style: "destructive",
                onPress: async () => {
                try {
                    // 1. Poista jäsen ryhmän members-subcollectionista
                    await deleteDoc(doc(firestore, "groups", groupId, "members", member.id));

                    // 2. Poista ryhmä käyttäjän omasta user-groups-listasta
                    await deleteDoc(doc(firestore, "user", member.id, "user-groups", groupId));

                    // 3. Päivitä paikallinen state heti
                    setMembers((prev) => prev.filter((m) => m.id !== member.id));

                    Alert.alert("Jäsen poistettu ryhmästä.");
                } catch (error) {
                    console.log("Virhe jäsenen poistossa:", error);
                    Alert.alert("Virhe", "Jäsenen poistaminen epäonnistui.");
                }
                },
            },
            ]
        );
        };

  const handleDeleteGroup = () => {
    Alert.alert(
      "Poista ryhmä",
      "Haluatko varmasti poistaa koko ryhmän? Tätä ei voi perua.",
      [
        { text: "Peruuta", style: "cancel" },
        {
          text: "Poista",
          style: "destructive",
          onPress: async () => {
            try {
                // 1. Poista ryhmä kaikilta jäseniltä user-groups-listasta
              for (const member of members) {
                await deleteDoc(
                    doc(firestore, "user", member.id, "user-groups", groupId)
                );
              }

                 // 2. Poista members-subcollectionin dokumentit
                const membersRef = collection(firestore, "groups", groupId, "members");
                const membersSnap = await getDocs(membersRef);

                 for (const memberDoc of membersSnap.docs) {
                 await deleteDoc(memberDoc.ref);
            }

                // 3. Poista messages-subcollectionin dokumentit
                 const messagesRef = collection(firestore, "groups", groupId, "messages");
                 const messagesSnap = await getDocs(messagesRef);

                 for (const messageDoc of messagesSnap.docs) {
                 await deleteDoc(messageDoc.ref);
            }
                // 4. Lopuksi poista itse ryhmän dokumentti
              await deleteDoc (doc(firestore, "groups", groupId));
              
              Alert.alert("Ryhmä poistettu");
              navigation.navigate("GroupsScreen");
            } catch (error) {
              console.log("Virhe ryhmän poistossa:", error);
              Alert.alert("Virhe", "Ryhmän poistaminen epäonnistui.");
            }
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
        Alert.alert(
            "Poistu ryhmästä",
            "Haluatko varmasti poistua tästä ryhmästä?",
            [
            { text: "Peruuta", style: "cancel" },
            {
                text: "Poistu",
                style: "destructive",
                onPress: async () => {
                try {
                    await deleteDoc(doc(firestore, "groups", groupId, "members", user.uid));
                    await deleteDoc(doc(firestore, "user", user.uid, "user-groups", groupId));

                    Alert.alert("Poistuit ryhmästä");
                    navigation.navigate("GroupsScreen");
                } catch (error) {
                    console.log("Virhe ryhmästä poistumisessa:", error);
                    Alert.alert("Virhe", "Ryhmästä poistuminen epäonnistui.");
                }
                },
            },
            ]
        );
        };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Ladataan ryhmän tietoja...</Text>
      </View>
    );
  }


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {isAdmin ? "Ryhmän asetukset" : "Lisää jäseniä"}
      </Text>

      {isAdmin && (
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Profiilikuva</Text>

            <GroupAvatarPicker
                avatarStyle={avatarStyle}
                avatarSeed={avatarSeed}
                setAvatarStyle={setAvatarStyle}
                setAvatarSeed={setAvatarSeed}
                groupName={groupName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Ryhmän nimi</Text>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              style={styles.input}
              placeholder="Anna ryhmän nimi"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Kuvaus</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.multilineInput]}
              placeholder="Kirjoita ryhmän kuvaus"
              multiline
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSaveGroup}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? "Tallennetaan..." : "Tallenna muutokset"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <Divider />

      <View style={styles.section}>
        <Text style={styles.label}>Jäsenet ({members.length})</Text>

        {members.map((member) => (
          <View key={member.id} style={styles.memberRow}>
            <View style={styles.memberLeft}>
              <UserAvatar
                avatarSeed={member.avatarSeed}
                avatarStyle={member.avatarStyle}
                size={42}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>
                  {member.role === "admin" ? "Admin" : "Jäsen"}
                </Text>
              </View>
            </View>

            {isAdmin && member.id !== user?.uid && (
                <TouchableOpacity
                    onPress={() => handleRemoveMember(member)}
                    style={styles.removeMemberButton}
                >
                    <Text style={styles.removeMemberButtonText}>Poista</Text>
                </TouchableOpacity>
                )}

          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setMembersModalVisible(true)}
      >
        <Text style={styles.primaryButtonText}>Lisää jäseniä</Text>
      </TouchableOpacity>

      {!isAdmin && (
        <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveGroup}
        >
            <Text style={styles.leaveButtonText}>Poistu ryhmästä</Text>
        </TouchableOpacity>
        )}

      {isAdmin && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteGroup}
        >
          <Text style={styles.deleteButtonText}>Poista koko ryhmä</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={membersModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMembersModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Valitse lisättävät jäsenet</Text>

            <FlatList
              data={friendsList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const selected = selectedFriends.includes(item.id);

                return (
                  <TouchableOpacity
                    style={[
                      styles.friendRow,
                      item.alreadyMember && styles.disabledFriendRow,
                    ]}
                    disabled={item.alreadyMember}
                    onPress={() => toggleFriendSelection(item.id)}
                  >
                    <View style={styles.memberLeft}>
                      <UserAvatar
                        avatarSeed={item.avatarSeed}
                        avatarStyle={item.avatarStyle}
                        size={42}
                      />

                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.memberName}>{item.name}</Text>
                        <Text style={styles.memberRole}>
                          {item.alreadyMember ? "Jo jäsen" : "Kaveri"}
                        </Text>
                      </View>
                    </View>

                    <Ionicons
                      name={
                        item.alreadyMember
                          ? "checkmark-circle"
                          : selected
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={24}
                      color={item.alreadyMember || selected ? "#f17a0a" : "#666"}
                    />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                  Kaverilistalla ei ole lisättäviä käyttäjiä.
                </Text>
              }
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAddSelectedMembers}
            >
              <Text style={styles.primaryButtonText}>Lisää valitut</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setSelectedFriends([]);
                setMembersModalVisible(false);
              }}
            >
              <Text style={styles.secondaryButtonText}>Sulje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
