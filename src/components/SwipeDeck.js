import React from "react";
import { View, Dimensions,Image } from "react-native";
import RecommendationCard from "./RecommendationsCard";

const { height } = Dimensions.get("window");

export default function SwipeDeck({
  users,
  currentIndex,
  onSwipeRight,
  onSwipeLeft,
}) {
  const visibleCards = users.slice(currentIndex, currentIndex + 3);

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {visibleCards
        .map((user, index) => (
          <RecommendationCard
            key={user.user_id}
            user={user}
            index={index}
            isTop={index === 0}
            onSwipeRight={onSwipeRight}
            onSwipeLeft={onSwipeLeft}
          />
        ))
        .reverse()}
    </View>
  );
}