import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import homeStyles from "../styles/Home";
import styles from "../styles/UserRecommendationsList";
import SwipingStyles from "../styles/Swiping.js";
import { ScrollView } from "react-native-gesture-handler";

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

    <ScrollView
    horizontal={true}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingTop: 10,paddingRight:10 }}
  >

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
          <View key={item.user_id} style={SwipingStyles.card}>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,}}>
              <View style={SwipingStyles.avatarPlaceholder}>
                <Text style={SwipingStyles.avatarLetter}>
                  {item.firstName ? item.firstName.charAt(0) : "?"}
                </Text>
              </View>

                <View style={SwipingStyles.headerText}>
                  <Text style={SwipingStyles.userName} numberOfLines={1}>
                    {item.firstName || "Tuntematon"}
                  </Text>

                  <Text styles={SwipingStyles.cityText}>Kaupunki: {item.city || "Ei tiedossa"}</Text>
                  </View>
                  </View>
            
              <View style={SwipingStyles.badgeRow}>
                <View style={SwipingStyles.matchBadge}>
                  <Text>Match score: {Math.round(item.score * 100)}%</Text>
                </View>

                <View style={SwipingStyles.infoBadge}>
                  <Text>Yhteisiä harrastuksia: {item.shared_count || 0}</Text>
                </View>
               </View>

            {item.shared_hobbies && item.shared_hobbies.length > 0 && (
              <View style={SwipingStyles.tagsContainer}>
                {item.shared_hobbies.slice(0, 4).map((hobby, index) => (
                  <View key={index} style={SwipingStyles.tag}>
              <Text style={SwipingStyles.tagText}>{hobby}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={SwipingStyles.debugText}>
              Debug status: {requestStatus || "ei pyyntöä"}
            </Text>

            {canSendRequest && (
              <TouchableOpacity
                onPress={() => onFriendRequest(item)}
                style={[SwipingStyles.actionButton, styles.actionButtonSpacing]}
              >
                <Text style={SwipingStyles.actionButtonText}>Lisää kaveriksi</Text>
              </TouchableOpacity>
            )}

            {isPending && (
              <View style={SwipingStyles.statusBoxPending}>
              <Text style={SwipingStyles.pendingText}>Pyyntö lähetetty</Text>
              </View>
            )}

            {isDeclined && (
              <View style={SwipingStyles.statusBoxDeclined}>
              <Text style={SwipingStyles.declinedText}>Pyyntö hylätty</Text>
              </View>
            )}

            {isAccepted && !isFriend && (
              <View style={SwipingStyles.statusBoxAccepted}>
              <Text style={SwipingStyles.acceptedText}>Pyyntö hyväksytty</Text>
              </View>
            )}

            {isFriend && (
                <View style={SwipingStyles.statusBoxAccepted}>
                  <Text style={SwipingStyles.acceptedText}>Jo kavereita</Text>
                </View>
              )}
          </View>
        );
      })}
      </ScrollView>
    </View>
  );
}