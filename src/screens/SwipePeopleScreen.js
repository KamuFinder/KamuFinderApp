import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../styles/SwipePeople";
import SwipeDeck from "../components/SwipeDeck";
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

  useEffect(() => {
    if (user?.uid) {
      fetchPeopleRecommendations();
    }
  }, [user]);

  const fetchPeopleRecommendations = async () => {
    try {
      if (!user?.uid) return;

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
            age: data.age || null,
            bio: data.bio || "",
            profileImage: data.profileImage || "",
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
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Virhe", "Kaveripyynnön lähetys epäonnistui.");
      throw error;
    }
  };

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const getRelationshipState = useCallback(
    (targetUser) => {
      if (!targetUser) {
        return {
          isFriend: false,
          requestStatus: null,
          isPending: false,
          isAccepted: false,
          canSendRequest: false,
        };
      }

      const isFriend = friendsList.some((f) => f.id === targetUser.user_id);

      const userRequest = allFriendRequests.find(
        (r) =>
          (r.fromUserId === user.uid && r.toUserId === targetUser.user_id) ||
          (r.toUserId === user.uid && r.fromUserId === targetUser.user_id)
      );

      const requestStatus = userRequest?.status || null;
      const isPending = requestStatus === "pending";
      const isAccepted = requestStatus === "accepted";
      const canSendRequest = !isFriend && !isPending && !isAccepted;

      return {
        isFriend,
        requestStatus,
        isPending,
        isAccepted,
        canSendRequest,
      };
    },
    [allFriendRequests, friendsList, user]
  );

  const enrichedRecommendations = useMemo(() => {
    return userRecommendations.map((recommendedUser) => {
      const relationship = getRelationshipState(recommendedUser);

      return {
        ...recommendedUser,
        ...relationship,
      };
    });
  }, [userRecommendations, getRelationshipState]);

  const currentUserItem = enrichedRecommendations[currentIndex];

  const handleLikeAndNext = useCallback(
    async (targetUser) => {
      try {
        if (!targetUser) return;

        if (targetUser.canSendRequest) {
          await handleFriendRequest(targetUser);
        }

        handleNext();
      } catch (error) {
        console.log("Virhe tykkäyksessä:", error);
      }
    },
    [handleNext]
  );

  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const remainingCount = enrichedRecommendations.length - currentIndex;
  const hasNoMoreCards = currentIndex >= enrichedRecommendations.length;

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Haetaan käyttäjiä...</Text>
      </SafeAreaView>
    );
  }

  if (hasNoMoreCards) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.emptyText}>Ei enempää käyttäjäsuosituksia.</Text>

        <TouchableOpacity
          onPress={fetchPeopleRecommendations}
          style={styles.reloadButton}
        >
          <Text style={styles.reloadButtonText}>Hae uudelleen</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Swaippaa käyttäjiä</Text>
      <Text style={styles.subtitle}>Jäljellä {remainingCount} käyttäjää</Text>

      <View style={styles.deckWrapper}>
        <SwipeDeck
          users={enrichedRecommendations}
          currentIndex={currentIndex}
          onSwipeRight={handleLikeAndNext}
          onSwipeLeft={handleSkip}
        />
      </View>

      {currentUserItem && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.actionText}>Ohita</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => handleLikeAndNext(currentUserItem)}
          >
            <Text style={styles.actionText}>
              {currentUserItem.canSendRequest ? "Tykkää" : "Seuraava"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}