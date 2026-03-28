import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import homeStyles from "../styles/Home";
import styles from "../styles/UserRecommendationsList";

export default function UserRecommendationsList({
  userRecommendations,
  friendsList,
  allFriendRequests,
  currentUserId,
  onFriendRequest,
}) {
  if (!userRecommendations || userRecommendations.length === 0) {
    return null;
  }

  return (
    <View style={homeStyles.recommendationsContainer}>
      <Text style={homeStyles.recommendationsTitle}>Suositellut käyttäjät</Text>

      {userRecommendations.map((item) => {
        const isFriend = friendsList.some((f) => f.id === item.user_id);

        const userRequest = allFriendRequests.find(
          (r) =>
            (r.fromUserId === currentUserId && r.toUserId === item.user_id) ||
            (r.toUserId === currentUserId && r.fromUserId === item.user_id)
        );

        const requestStatus = userRequest?.status;
        const isPending = requestStatus === "pending";
        const isDeclined = requestStatus === "declined";
        const isAccepted = requestStatus === "accepted";
        const canSendRequest = !isFriend && !isPending && !isAccepted;

        return (
          <View key={item.user_id} style={homeStyles.recommendationCard}>
            <Text style={homeStyles.recommendationName}>
              {item.firstName || "Tuntematon"}
            </Text>

            <Text>Kaupunki: {item.city || "Ei tiedossa"}</Text>
            <Text>Match score: {Math.round(item.score * 100)}%</Text>
            <Text>Yhteisiä harrastuksia: {item.shared_count || 0}</Text>

            {item.shared_hobbies && item.shared_hobbies.length > 0 && (
              <Text>{item.shared_hobbies.join(", ")}</Text>
            )}

            <Text style={styles.debugText}>
              Debug status: {requestStatus || "ei pyyntöä"}
            </Text>

            {canSendRequest && (
              <TouchableOpacity
                onPress={() => onFriendRequest(item)}
                style={styles.friendButton}
              >
                <Text style={styles.friendButtonText}>Lisää kaveriksi</Text>
              </TouchableOpacity>
            )}

            {isPending && (
              <Text style={styles.pendingText}>Pyyntö lähetetty</Text>
            )}

            {isDeclined && (
              <Text style={styles.declinedText}>Pyyntö hylätty</Text>
            )}

            {isAccepted && !isFriend && (
              <Text style={styles.friendText}>Pyyntö hyväksytty</Text>
            )}

            {isFriend && <Text style={styles.friendText}>Jo kavereita</Text>}
          </View>
        );
      })}
    </View>
  );
}