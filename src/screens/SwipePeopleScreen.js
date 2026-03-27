import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecommendationCard from "../components/RecommendationCard";
import { useUser } from "../context/UserContext.js";
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
} from "../firebase/config";
import { fetchUserRecommendations } from "../../services/recommendationService";

export default function SwipePeopleScreen() {
  const user = useUser();

  const [userRecommendations, setUserRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
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

    const friendRequestsRef = collection(firestore, USERS, user.uid, FRIENDREQUESTS);
    const unsubscribe = onSnapshot(friendRequestsRef, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllFriendRequests(requests);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    fetchPeopleRecommendations();
  }, [user]);

  const fetchPeopleRecommendations = async () => {
    try {
      if (!user) return;

      setLoading(true);

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
      setCurrentIndex(0);
    } catch (error) {
      console.log("Virhe käyttäjäsuositusten haussa:", error);
      Alert.alert("Virhe", "Käyttäjäsuosituksia ei voitu hakea");
    } finally {
      setLoading(false);
    }
  };

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

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const currentUserItem = userRecommendations[currentIndex];

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Haetaan käyttäjiä...</Text>
      </SafeAreaView>
    );
  }

  if (!currentUserItem) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Ei enempää käyttäjäsuosituksia.</Text>

        <TouchableOpacity onPress={fetchPeopleRecommendations} style={{ marginTop: 20 }}>
          <Text>Hae uudelleen</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isFriend = friendsList.some((f) => f.id === currentUserItem.user_id);

  const userRequest = allFriendRequests.find(
    (r) =>
      (r.fromUserId === user.uid && r.toUserId === currentUserItem.user_id) ||
      (r.toUserId === user.uid && r.fromUserId === currentUserItem.user_id)
  );

  const requestStatus = userRequest?.status;

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
      <RecommendationCard
        user={currentUserItem}
        requestStatus={requestStatus}
        isFriend={isFriend}
        onAddFriend={() => handleFriendRequest(currentUserItem)}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 24 }}>
        <TouchableOpacity onPress={handleNext}>
          <Text>Ohita</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            await handleFriendRequest(currentUserItem);
            handleNext();
          }}
        >
          <Text>Tykkää</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}