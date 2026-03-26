import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext.js";
import styles from "../styles/Home.js";
import {
  firestore,
  USERS,
  FRIENDREQUESTS,
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  API_BASE_URL,
} from "../firebase/config";
import { fetchUserRecommendations } from "../../services/recommendationService";

export default function SwipingScreen() {
  const user = useUser();

  const [groupRecommendations, setGroupRecommendations] = useState([]);
  const [userRecommendations, setUserRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [allFriendRequests, setAllFriendRequests] = useState([]);

  useEffect(() => {
    if (!user) return;

    const friendsRef = collection(firestore, USERS, user.uid, "friends");

    const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
      const friends = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFriendsList(friends);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const friendRequestsRef = collection(
      firestore,
      USERS,
      user.uid,
      FRIENDREQUESTS
    );

    const unsubscribe = onSnapshot(friendRequestsRef, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllFriendRequests(requests);
    });

    return () => unsubscribe();
  }, [user]);

  const handleFriendRequest = async (targetUser) => {
    try {
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
      if (!user) {
        Alert.alert("Virhe", "Käyttäjää ei ole kirjautuneena");
        return;
      }

      const userRef = doc(firestore, USERS, user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert("Virhe", "Käyttäjän tietoja ei löytynyt");
        return;
      }

      const userData = userSnap.data();
      const hobbyInterests = Array.isArray(userData.hobby_interests)
        ? userData.hobby_interests
        : [];

      const response = await fetch(`${API_BASE_URL}/recommend/hobby`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hobby_interests: hobbyInterests,
        }),
      });

      const data = await response.json();

      if (data.error) {
        Alert.alert("Virhe", data.error);
        return;
      }

      setGroupRecommendations(data.recommendations || []);
    } catch (error) {
      console.log("Virhe ryhmäsuositusten haussa:", error);
      Alert.alert("Virhe", "Ryhmäsuosituksia ei voitu hakea");
    }
  };

  const fetchPeopleRecommendations = async () => {
    try {
      if (!user) {
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
      await fetchGroupRecommendations();
      await fetchPeopleRecommendations();
    } finally {
      setLoading(false);
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
        <Text style={styles.title}>Swaippailu sivu</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={fetchAllRecommendations}
        >
          <Text style={styles.actionButtonText}>Hae suositukset</Text>
        </TouchableOpacity>

        {loading && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 10 }}>Haetaan suosituksia...</Text>
          </View>
        )}

        {userRecommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Suositellut käyttäjät</Text>

            {userRecommendations.map((item) => {
              const isFriend = friendsList.some((f) => f.id === item.user_id);

              const userRequest = allFriendRequests.find(
                (r) =>
                  (r.fromUserId === user.uid && r.toUserId === item.user_id) ||
                  (r.toUserId === user.uid && r.fromUserId === item.user_id)
              );

              const requestStatus = userRequest?.status;
              const isPending = requestStatus === "pending";
              const isDeclined = requestStatus === "declined";
              const isAccepted = requestStatus === "accepted";
              const canSendRequest = !isFriend && !isPending && !isAccepted;

              return (
                <View key={item.user_id} style={styles.recommendationCard}>
                  <Text style={styles.recommendationName}>
                    {item.firstName || "Tuntematon"}
                  </Text>
                  <Text>Kaupunki: {item.city || "Ei tiedossa"}</Text>
                  <Text>Match score: {Math.round(item.score * 100)}%</Text>
                  <Text>Yhteisiä harrastuksia: {item.shared_count || 0}</Text>

                  {item.shared_hobbies && item.shared_hobbies.length > 0 && (
                    <Text>{item.shared_hobbies.join(", ")}</Text>
                  )}

                  <Text style={{ marginTop: 6, color: "#666" }}>
                    Debug status: {requestStatus || "ei pyyntöä"}
                  </Text>

                  {canSendRequest && (
                    <TouchableOpacity
                      onPress={() => handleFriendRequest(item)}
                      style={localStyles.friendButton}
                    >
                      <Text style={localStyles.friendButtonText}>
                        Lisää kaveriksi
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isPending && (
                    <Text style={localStyles.pendingText}>Pyyntö lähetetty</Text>
                  )}

                  {isDeclined && (
                    <Text style={localStyles.declinedText}>Pyyntö hylätty</Text>
                  )}

                  {isAccepted && !isFriend && (
                    <Text style={localStyles.friendText}>Pyyntö hyväksytty</Text>
                  )}

                  {isFriend && (
                    <Text style={localStyles.friendText}>Jo kavereita</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>Suositellut kaveriryhmät</Text>

          {groupRecommendations.length === 0 ? (
            <Text>Ei ryhmäsuosituksia juuri nyt.</Text>
          ) : (
            groupRecommendations.map((item) => (
              <View key={item.group_id} style={styles.recommendationCard}>
                <Text style={styles.recommendationName}>{item.group_name}</Text>
                <Text>{item.description}</Text>
                <Text>Jäseniä: {item.member_count}</Text>
                <Text>Match score: {Math.round(item.score * 100)}%</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 220,
    flexGrow: 1,
  },
  friendButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  friendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pendingText: {
    color: "#999",
    marginTop: 8,
  },
  declinedText: {
    color: "#aaa",
    marginTop: 8,
  },
  friendText: {
    color: "green",
    marginTop: 8,
    fontWeight: "600",
  },
});