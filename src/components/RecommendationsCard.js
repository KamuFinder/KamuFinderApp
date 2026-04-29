import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import styles from "../styles/RecommendationsCard";

const SWIPE_THRESHOLD = 120;
const OFFSCREEN = 500;

export default function RecommendationCard({
  user,
  index,
  isTop,
  onSwipeRight,
  onSwipeLeft,
}) {

  const navigation = useNavigation();
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

  const displayName =
  user?.nickName || user?.firstName || "Tuntematon";

const fullName =
  user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || "";

const avatarUrl =
  user?.profileImage ||
  `https://api.dicebear.com/7.x/${user?.avatarStyle || "adventurer"}/png?seed=${
    user?.avatarSeed || user?.user_id
  }`;

const content = (
  <Animated.View style={[styles.card, animatedStyle]}>
    <Pressable
    style={styles.pressableContent}
    disabled={!isTop}
    onPress={() => navigation.navigate("Profile", { 
      userId: user.user_id,
    user: user,
    })}
  >
    <Animated.Text style={[styles.likeText, likeStyle]}>LIKE</Animated.Text>
    <Animated.Text style={[styles.skipText, skipStyle]}>SKIP</Animated.Text>

    <View style={styles.imageWrapper}>
      <Image source={{ uri: avatarUrl }} style={styles.image} />
    </View>

    <View style={styles.content}>
      <Text style={styles.name}>{displayName}</Text>

      {!!fullName && fullName !== displayName && (
        <Text style={styles.fullName}>{fullName}</Text>
      )}

      <Text style={styles.city}>📍 {user?.city || "Ei kaupunkia"}</Text>

      {!!user?.bio && (
        <Text style={styles.bio} numberOfLines={4}>
          {user.bio}
        </Text>
      )}

      {user?.hobby_interests?.length > 0 && (
        <View style={styles.tagsContainer}>
          {user.hobby_interests.slice(0, 2).map((hobby) => (
            <View key={hobby} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{hobby}</Text>
            </View>
          ))}

          {user.hobby_interests.length > 2 && (
          <View style={styles.moreTag}>
            <Text style={styles.moreTagText}>
              +{user.hobby_interests.length - 2}
            </Text>
        </View>
    )}
        </View>
      )}

        {/*<Text style={styles.metaText}>
          Match: {Math.round((user?.score || 0) * 100)}%
        </Text>

        <Text style={styles.metaText}>
          Yhteisiä: {user?.shared_count || 0}
        </Text>

        {user?.shared_hobbies?.length > 0 && (
          <Text style={styles.hobbies}>
            {user.shared_hobbies.join(", ")}
          </Text>
        )}*/}

        {/*{isTop && canSendRequest && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => onSwipeRight(user)}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Lisää kaveriksi</Text>
          </TouchableOpacity>
        )}*/}

        {isFriend ? (
          <Text style={styles.info}>Jo kavereita</Text>
        ) : isPending ? (
          <Text style={styles.info}>Pyyntö lähetetty</Text>
        ) : isAccepted ? (
          <Text style={styles.info}>Hyväksytty</Text>
        ) : null}
      </View>
    </Pressable>
    </Animated.View>
  );

  if (!isTop) return content;

  return <GestureDetector gesture={panGesture}>{content}</GestureDetector>;
}