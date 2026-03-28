import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../styles/RecommendationCard";

export default function RecommendationCard({
  user,
  onAddFriend,
  requestStatus,
  isFriend,
}) {
  const isPending = requestStatus === "pending";
  const isDeclined = requestStatus === "declined";
  const isAccepted = requestStatus === "accepted";
  const canSendRequest = !isFriend && !isPending && !isAccepted;

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{user?.firstName || "Tuntematon"}</Text>
      <Text>Kaupunki: {user?.city || "Ei tiedossa"}</Text>
      <Text>Match score: {Math.round((user?.score || 0) * 100)}%</Text>
      <Text>Yhteisiä harrastuksia: {user?.shared_count || 0}</Text>

      {user?.shared_hobbies?.length > 0 && (
        <Text style={styles.hobbies}>{user.shared_hobbies.join(", ")}</Text>
      )}

      {canSendRequest && (
        <TouchableOpacity style={styles.button} onPress={onAddFriend}>
          <Text style={styles.buttonText}>Lisää kaveriksi</Text>
        </TouchableOpacity>
      )}

      {isPending && <Text style={styles.info}>Pyyntö lähetetty</Text>}
      {isDeclined && <Text style={styles.info}>Pyyntö hylätty</Text>}
      {isAccepted && !isFriend && (
        <Text style={styles.info}>Pyyntö hyväksytty</Text>
      )}
      {isFriend && <Text style={styles.info}>Jo kavereita</Text>}
    </View>
  );
}