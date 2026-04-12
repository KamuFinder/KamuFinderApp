import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import homeStyles from "../styles/Home";
import { SvgUri } from "react-native-svg";

const getGroupAvatarUrl = (seed, style, name = "Group", size = 60) => {
  if (!seed || !style) return null;

  const params = new URLSearchParams({
    email: seed,
    name,
    v: String(style),
    size: String(size),
  });

  return `https://classyprofile.com/api/avatar?${params.toString()}`;
};

export default function GroupRecommendationsList({ groups, onJoinGroup }) {
  return (
    <View style={homeStyles.recommendationsContainer}>
      <Text style={homeStyles.recommendationsTitle}>
        Suositellut study groupit
      </Text>

      {!groups || groups.length === 0 ? (
        <Text>Ei ryhmäsuosituksia juuri nyt.</Text>
      ) : (
        groups.map((item) => {
          const avatarUrl = getGroupAvatarUrl(
            item.avatarSeed, 
            item.avatarStyle, 
            item.name,
            60
          );

          return (
          <View key={item.group_id} style={homeStyles.recommendationCard}>
            <View style={{
              flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
            }}
            >
              {avatarUrl ? (
                <View style={{
                  width: 60,
                      height: 60,
                      borderRadius: 30,
                      overflow: "hidden",
                      backgroundColor: "#ddd",
                      marginRight: 12,
                      alignItems: "center",
                      justifyContent: "center",
                }}
                >
                  <SvgUri uri={avatarUrl} width="60" height="60" />
                </View>
              ) : null}

              <View style={{ flex: 1 }}>

            <Text style={homeStyles.recommendationName}>{item.name}</Text>

            {!!item.description && <Text>{item.description}</Text>}
              </View>
            </View>

            <Text>Jäseniä: {item.memberCount || 0}</Text>
            <Text>Match score: {Math.round((item.score || 0) * 100)}%</Text>
            <Text>Yhteisiä kiinnostuksia: {item.shared_count || 0}</Text>

            {item.shared_interests?.length > 0 && (
              <Text>{item.shared_interests.join(", ")}</Text>
            )}

            <TouchableOpacity
              style={[
                homeStyles.actionButton,
                item.alreadyJoined && { backgroundColor: "#999" },
              ]}
              onPress={() => {
                if (!item.alreadyJoined) {
                  onJoinGroup(item);
                }
              }}
              disabled={item.alreadyJoined}
            >
              <Text style={homeStyles.actionButtonText}>
                {item.alreadyJoined ? "Jo jäsen" : "Liity ryhmään"}
              </Text>
            </TouchableOpacity>
          </View>
          );
})
      )}
    </View>
  );
}