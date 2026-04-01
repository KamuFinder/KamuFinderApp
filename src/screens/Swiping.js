import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext.js";
import styles from "../styles/Home.js";
import localStyles from "../styles/Swiping";
import {
  firestore,
  USERS,
  FRIENDREQUESTS,
  SUB_GROUPS,
  PUBLIC_GROUPS,
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  onSnapshot,
} from "../firebase/config";
import {
  fetchUserRecommendations,
  fetchStudyGroupRecommendations,
} from "../../services/recommendationService";
import UserRecommendationsList from "../components/UserRecommendationsList";
import GroupRecommendationsList from "../components/GroupRecommendationsList";

export default function SwipingScreen({ navigation }) {
  const user = useUser();

  const [groupRecommendations, setGroupRecommendations] = useState([]);
  const [userRecommendations, setUserRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [allFriendRequests, setAllFriendRequests] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const friendsRef = collection(firestore, USERS, user.uid, "friends");

    const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
      const friends = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setFriendsList(friends);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;

    const friendRequestsRef = collection(
      firestore,
      USERS,
      user.uid,
      FRIENDREQUESTS
    );

    const unsubscribe = onSnapshot(friendRequestsRef, (snapshot) => {
      const requests = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setAllFriendRequests(requests);
    });

    return () => unsubscribe();
  }, [user]);

  const handleFriendRequest = async (targetUser) => {
    try {
      if (!user?.uid || !targetUser?.user_id) return;

      const currentUserRequestsRef = collection(
        firestore,
        USERS,
        user.uid,
        FRIENDREQUESTS
      );

      const targetUserRequestsRef = collection(
        firestore,
        USERS,
        targetUser.user_id,
        FRIENDREQUESTS
      );

      const requestData = {
        fromUserId: user.uid,
        toUserId: targetUser.user_id,
        status: "pending",
        timestamp: serverTimestamp(),
      };

      await addDoc(currentUserRequestsRef, requestData);
      await addDoc(targetUserRequestsRef, requestData);

      Alert.alert("Pyyntö lähetetty");
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Virhe", "Kaveripyynnön lähetys epäonnistui.");
    }
  };

  const fetchGroupRecommendations = async () => {
    try {
      if (!user?.uid) {
        Alert.alert("Virhe", "Käyttäjää ei ole kirjautuneena");
        return;
      }

      const currentUserRef = doc(firestore, USERS, user.uid);
      const currentUserSnap = await getDoc(currentUserRef);

      if (!currentUserSnap.exists()) {
        Alert.alert("Virhe", "Käyttäjän tietoja ei löytynyt");
        return;
      }

      const currentUserData = currentUserSnap.data();

      const groupsSnapshot = await getDocs(collection(firestore, PUBLIC_GROUPS));

      const groups = groupsSnapshot.docs.map((groupDoc) => {
        const data = groupDoc.data();

        return {
          group_id: groupDoc.id,
          name: data.groupName || "",
          description: data.desc || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          memberCount: data.memberCount || 0,
        };
      });

      console.log("USER study_interests:", currentUserData.study_interests);
      console.log("GROUPS FROM FIRESTORE:", groups);

      const recommendations = await fetchStudyGroupRecommendations(
        user.uid,
        Array.isArray(currentUserData.study_interests)
          ? currentUserData.study_interests
          : [],
        groups
      );

      console.log("BACKEND RESPONSE (study groups):", recommendations);

      setGroupRecommendations(recommendations || []);
    } catch (error) {
      console.log("❌ VIRHE STUDY GROUP HAUSSA:");
      console.log("error:", error);
      console.log("status:", error?.response?.status);
      console.log("data:", error?.response?.data);
      console.log("message:", error?.message);

      Alert.alert(
        "Virhe",
        error?.response?.data?.detail
          ? JSON.stringify(error.response.data.detail)
          : error?.message || "Ryhmäsuosituksia ei voitu hakea"
      );
    }
  };

  const fetchPeopleRecommendations = async () => {
    try {
      if (!user?.uid) {
        Alert.alert("Virhe", "Käyttäjää ei ole kirjautuneena");
        return;
      }

      const currentUserRef = doc(firestore, USERS, user.uid);
      const currentUserSnap = await getDoc(currentUserRef);

      if (!currentUserSnap.exists()) {
        Alert.alert("Virhe", "Käyttäjän tietoja ei löytynyt");
        return;
      }

      const currentUserData = currentUserSnap.data();
      const usersSnapshot = await getDocs(collection(firestore, USERS));

      const candidates = usersSnapshot.docs
        .map((userDoc) => {
          const data = userDoc.data();

          return {
            user_id: userDoc.id,
            firstName: data.firstName || "",
            city: data.city || "",
            hobby_interests: Array.isArray(data.hobby_interests)
              ? data.hobby_interests
              : [],
          };
        })
        .filter((candidate) => candidate.user_id !== user.uid);

      const recommendations = await fetchUserRecommendations(
        user.uid,
        Array.isArray(currentUserData.hobby_interests)
          ? currentUserData.hobby_interests
          : [],
        candidates
      );

      setUserRecommendations(recommendations || []);
    } catch (error) {
      console.log("Virhe käyttäjäsuositusten haussa:", error);
      Alert.alert("Virhe", "Käyttäjäsuosituksia ei voitu hakea");
    }
  };

  const fetchAllRecommendations = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchGroupRecommendations(),
        fetchPeopleRecommendations(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinStudyGroup = async (group) => {
    try {
      if (!user?.uid || !group?.group_id) return;

      const currentUserRef = doc(firestore, USERS, user.uid);
      const currentUserSnap = await getDoc(currentUserRef);

      if (!currentUserSnap.exists()) {
        Alert.alert("Virhe", "Käyttäjän tietoja ei löytynyt");
        return;
      }

      const currentUserData = currentUserSnap.data();

      const userSubGroupRef = doc(
        firestore,
        USERS,
        user.uid,
        SUB_GROUPS,
        group.group_id
      );

      const groupRef = doc(firestore, PUBLIC_GROUPS, group.group_id);

      await setDoc(userSubGroupRef, {
        userId: user.uid,
        firstName: currentUserData?.firstName || "",
        joinedAt: serverTimestamp(),
        role: "member",
        groupId: group.group_id,
        groupName: group.name,
      });

      await updateDoc(groupRef, {
        memberCount: increment(1),
      });

      Alert.alert("Onnistui", `Liityit ryhmään ${group.name}`);

      await fetchGroupRecommendations();
    } catch (error) {
      console.error("Virhe ryhmään liittymisessä:", error);
      Alert.alert("Virhe", "Ryhmään liittyminen epäonnistui");
    }
  };

  return (
    <SafeAreaView style={localStyles.safeArea}>
      <ScrollView
        style={localStyles.scroll}
        contentContainerStyle={localStyles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <Text style={styles.title}>Etsi uusia kavereita!</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={fetchAllRecommendations}
        >
          <Text style={styles.actionButtonText}>Hae suositukset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("SwipePeople")}
        >
          <Text style={styles.actionButtonText}>
            Selaa käyttäjiä swaippaamalla
          </Text>
        </TouchableOpacity>

        {loading && (
          <View style={localStyles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={localStyles.loadingText}>Haetaan suosituksia...</Text>
          </View>
        )}

        <UserRecommendationsList
          userRecommendations={userRecommendations}
          friendsList={friendsList}
          allFriendRequests={allFriendRequests}
          currentUserId={user?.uid}
          onFriendRequest={handleFriendRequest}
        />

        <GroupRecommendationsList
          groups={groupRecommendations}
          onJoinGroup={handleJoinStudyGroup}
        />
      </ScrollView>
    </SafeAreaView>
  );
}