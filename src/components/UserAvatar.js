import React from "react";
import { Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UserAvatar({
  avatarSeed,
  avatarStyle,
  size = 50,
}) {

const avatarStyleSafe = avatarStyle || "fun-emoji";

  const avatarUrl = avatarSeed
    ? `https://api.dicebear.com/9.x/${avatarStyleSafe}/png?seed=${encodeURIComponent(
        avatarSeed
      )}`
    : null;           

  if (!avatarUrl) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#ddd",
          alignItems: "center",
          justifyContent: "center",
          
        }}
      >
        <Ionicons name="person" size={size * 0.5} color="#777" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: avatarUrl }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: "#fff",
        
      }}
    />
  );
}