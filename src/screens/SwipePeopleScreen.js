import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
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
  setDoc,
  serverTimestamp,
  onSnapshot,
} from "../firebase/config";
//import { fetchUserRecommendations } from "../../services/recommendationService";

export default function SwipePeopleScreen() {
  const user = useUser();

  const [userRecommendations, setUserRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendsList, setFriendsList] = useState([]);
  const [allFriendRequests, setAllFriendRequests] = useState([]);
  const [swipedUserIds, setSwipedUserIds] = useState([]);

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
  }, [user?.uid]);

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
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      fetchPeopleRecommendations();
    }
  }, [user?.uid]);

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

      const usersSnapshot = await getDocs(collection(firestore, USERS));

      const candidates = usersSnapshot.docs
        .map((userDoc) => {
          const data = userDoc.data();

          const avatarStyle = data.avatarStyle || "adventurer";
          const avatarSeed = data.avatarSeed || userDoc.id;

          return {
            user_id: userDoc.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            nickName: data.nickName || "",
            city: data.city || "",
            bio: data.profile_text || "",
            avatarSeed: data.avatarSeed || "",
            avatarStyle,
            profileImage:`https://api.dicebear.com/7.x/${avatarStyle}/png?seed=${avatarSeed}`,
            hobby_interests: Array.isArray(data.hobby_interests)
              ? data.hobby_interests
              : [],
          };
        })
        .filter((candidate) => candidate.user_id !== user.uid);

      {/*const recommendations = await fetchUserRecommendations(
        user.uid,
        Array.isArray(currentUserData.hobby_interests)
          ? currentUserData.hobby_interests
          : [],
        candidates
      );*/}

      setUserRecommendations(candidates);
      setSwipedUserIds([]);
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

      {/*const currentUserRequestsRef = collection(
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
      );*/}

      const requestData = {
        fromUserId: user.uid,
        toUserId: targetUser.user_id,
        status: "pending",
        timestamp: serverTimestamp(),
      };

       await setDoc(
        doc(firestore, USERS, user.uid, FRIENDREQUESTS, targetUser.user_id),
        requestData,
        { merge: true }
      );

      await setDoc(
        doc(firestore, USERS, targetUser.user_id, FRIENDREQUESTS, user.uid),
        requestData,
        { merge: true }
      );
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Virhe", "Kaveripyynnön lähetys epäonnistui.");
      throw error;
    }
  };

  

  const getRelationshipState = useCallback(
    (targetUser) => {
      if (!targetUser || !user?.uid) {
        return {
          isFriend: false,
          requestStatus: null,
          isPending: false,
          isAccepted: false,
          canSendRequest: false,
        };
      }

      const isFriend = friendsList.some((friend) => {
        return friend.id === targetUser.user_id || friend.user_id === targetUser.user_id;
      });

      const userRequest = allFriendRequests.find(
        (request) =>
          (request.fromUserId === user.uid && 
            request.toUserId === targetUser.user_id) ||
          (request.toUserId === user.uid && 
            request.fromUserId === targetUser.user_id)
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
    [allFriendRequests, friendsList, user?.uid]
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

   const visibleRecommendations = useMemo(() => {
    return enrichedRecommendations.filter(
      (recommendedUser) =>
        recommendedUser.canSendRequest &&
        !swipedUserIds.includes(recommendedUser.user_id)
    );
  }, [enrichedRecommendations, swipedUserIds]);

  const currentUserItem = visibleRecommendations[0];
  const remainingCount = visibleRecommendations.length;
  const hasNoMoreCards = visibleRecommendations.length === 0;

  const hideUser = useCallback((targetUser) => {
    if (!targetUser?.user_id) return;

    setSwipedUserIds((prev) => {
      if (prev.includes(targetUser.user_id)) {
        return prev;
      }

      return [...prev, targetUser.user_id];
    });
  }, []);


  const handleLikeAndNext = useCallback(
    async (targetUser) => {
      try {
        if (!targetUser) return;

        hideUser(targetUser);

        if (targetUser.canSendRequest) {
          await handleFriendRequest(targetUser);
        }
      } catch (error) {
        console.log("Virhe tykkäyksessä:", error);
      }
    },
    [hideUser, user?.uid]
  );

  const handleSkip = useCallback(() => {
    if (currentUserItem) {
      hideUser(currentUserItem);
    }
  }, [currentUserItem, hideUser]);

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
    <SafeAreaView style={styles.container} edges={["top", "left", "right" ]}>
      <Text style={styles.title}>Swaippaa käyttäjiä</Text>
      <Text style={styles.subtitle}>Jäljellä {remainingCount} käyttäjää</Text>

      <View style={styles.deckWrapper}>
        <SwipeDeck
          users={visibleRecommendations}
          currentIndex={0}
          onSwipeRight={handleLikeAndNext}
          onSwipeLeft={handleSkip}
        />
      </View>

      {currentUserItem && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Ohita</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => handleLikeAndNext(currentUserItem)}
          >
            <Text style={styles.likeButtonText}>
              {currentUserItem.canSendRequest ? "Tykkää" : "Seuraava"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}