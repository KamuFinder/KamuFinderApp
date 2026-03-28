import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import styles from "../styles/SwipePeople";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

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

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function SwipePeopleScreen() {
  const user = useUser();

  const [userRecommendations, setUserRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [friendsList, setFriendsList] = useState([]);
  const [allFriendRequests, setAllFriendRequests] = useState([]);

  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!user) return;

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
    if (!user) return;

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
    if (user) {
      fetchPeopleRecommendations();
    }
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
      translateX.value = 0;
      rotate.value = 0;
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

  const resetCardPosition = () => {
    translateX.value = 0;
    rotate.value = 0;
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    resetCardPosition();
  };

  const currentUserItem = userRecommendations[currentIndex];

  const isFriend = currentUserItem
    ? friendsList.some((f) => f.id === currentUserItem.user_id)
    : false;

  const userRequest = currentUserItem
    ? allFriendRequests.find(
        (r) =>
          (r.fromUserId === user.uid && r.toUserId === currentUserItem.user_id) ||
          (r.toUserId === user.uid && r.fromUserId === currentUserItem.user_id)
      )
    : null;

  const requestStatus = userRequest?.status;
  const isPending = requestStatus === "pending";
  const isAccepted = requestStatus === "accepted";
  const canSendRequest =
    !!currentUserItem && !isFriend && !isPending && !isAccepted;

  const handleLikeAndNext = async (targetUser, shouldSendRequest) => {
    try {
      if (shouldSendRequest) {
        await handleFriendRequest(targetUser);
      }
      handleNext();
    } catch (error) {
      console.log("Virhe tykkäyksessä:", error);
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value > 0 ? Math.min(translateX.value / 100, 1) : 0,
    };
  });

  const skipStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value < 0 ? Math.min(-translateX.value / 100, 1) : 0,
    };
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotate.value = event.translationX / 20;
    })
    .onEnd(() => {
      if (!currentUserItem) {
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
        return;
      }

      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH + 120, {}, () => {
          translateX.value = 0;
          rotate.value = 0;
          runOnJS(handleLikeAndNext)(currentUserItem, canSendRequest);
        });
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH - 120, {}, () => {
          translateX.value = 0;
          rotate.value = 0;
          runOnJS(handleNext)();
        });
      } else {
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Haetaan käyttäjiä...</Text>
      </SafeAreaView>
    );
  }

  if (!currentUserItem) {
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

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardWrapper, animatedCardStyle]}>
          <Animated.Text style={[styles.likeText, likeStyle]}>
            LIKE
          </Animated.Text>

          <Animated.Text style={[styles.skipText, skipStyle]}>
            SKIP
          </Animated.Text>

          <RecommendationCard
            user={currentUserItem}
            requestStatus={requestStatus}
            isFriend={isFriend}
            onAddFriend={() =>
              handleLikeAndNext(currentUserItem, canSendRequest)
            }
          />
        </Animated.View>
      </GestureDetector>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.skipButton} onPress={handleNext}>
          <Text style={styles.actionText}>Ohita</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => handleLikeAndNext(currentUserItem, canSendRequest)}
        >
          <Text style={styles.actionText}>Tykkää</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}