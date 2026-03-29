import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import styles from "../styles/RecommendationCard";

const SWIPE_THRESHOLD = 120;
const OFFSCREEN = 500;

export default function RecommendationCard({
  user,
  index,
  isTop,
  onSwipeRight,
  onSwipeLeft,
}) {
  const translateX = useSharedValue(0);

  const handleRight = () => {
    onSwipeRight(user);
  };

  const handleLeft = () => {
    onSwipeLeft(user);
  };

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withTiming(OFFSCREEN, { duration: 220 }, () => {
          runOnJS(handleRight)();
        });
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-OFFSCREEN, { duration: 220 }, () => {
          runOnJS(handleLeft)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    if (isTop) {
      const rotate = `${interpolate(
        translateX.value,
        [-200, 0, 200],
        [-12, 0, 12],
        Extrapolation.CLAMP
      )}deg`;

      return {
        zIndex: 30,
        elevation: 30,
        transform: [
          { translateX: translateX.value },
          { rotate },
          { scale: 1 },
        ],
      };
    }

    if (index === 1) {
      return {
        zIndex: 20,
        elevation: 20,
        transform: [{ scale: 0.96 }, { translateY: 12 }],
      };
    }

    if (index === 2) {
      return {
        zIndex: 10,
        elevation: 10,
        transform: [{ scale: 0.92 }, { translateY: 24 }],
      };
    }

    return {};
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 50, 120],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
  }));

  const skipStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-120, -50, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    ),
  }));

  const isPending = user?.requestStatus === "pending";
  const isAccepted = user?.requestStatus === "accepted";
  const isFriend = !!user?.isFriend;
  const canSendRequest = !!user?.canSendRequest;

  const content = (
    <Animated.View style={[styles.card, animatedStyle]}>
      {user?.profileImage ? (
        <Image source={{ uri: user.profileImage }} style={styles.image} />
      ) : (
        <View style={styles.image} />
      )}

      <Animated.Text style={[styles.likeText, likeStyle]}>
        LIKE
      </Animated.Text>

      <Animated.Text style={[styles.skipText, skipStyle]}>
        SKIP
      </Animated.Text>

      <View style={styles.content}>
        <Text style={styles.name}>
          {user?.firstName || "Tuntematon"}
        </Text>

        <Text style={styles.city}>
          {user?.city || "Ei tiedossa"}
        </Text>

        <Text style={styles.metaText}>
          Match: {Math.round((user?.score || 0) * 100)}%
        </Text>

        <Text style={styles.metaText}>
          Yhteisiä: {user?.shared_count || 0}
        </Text>

        {user?.shared_hobbies?.length > 0 && (
          <Text style={styles.hobbies}>
            {user.shared_hobbies.join(", ")}
          </Text>
        )}

        {isTop && canSendRequest && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => onSwipeRight(user)}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Lisää kaveriksi</Text>
          </TouchableOpacity>
        )}

        {isFriend ? (
          <Text style={styles.info}>Jo kavereita</Text>
        ) : isPending ? (
          <Text style={styles.info}>Pyyntö lähetetty</Text>
        ) : isAccepted ? (
          <Text style={styles.info}>Hyväksytty</Text>
        ) : null}
      </View>
    </Animated.View>
  );

  if (!isTop) return content;

  return <GestureDetector gesture={panGesture}>{content}</GestureDetector>;
}