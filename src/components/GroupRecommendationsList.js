import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import homeStyles from "../styles/Home";
import SwipingStyles from "../styles/Swiping.js";
import { SvgUri } from "react-native-svg";
import { ScrollView } from "react-native-gesture-handler";


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

        <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10,paddingRight:10 }}
      >
         {groups.map((item) => {
          const avatarUrl = getGroupAvatarUrl(
            item.avatarSeed, 
            item.avatarStyle, 
            item.name,
            60
          );

          return (
          <View key={item.group_id} style={SwipingStyles.card}>
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
              ) : (
                    <View style={SwipingStyles.avatarPlaceholder}>
                      <Text style={SwipingStyles.avatarLetter}>
                        {item.name?.charAt(0)?.toUpperCase() || "G"}
                      </Text>
                    </View>
                  )}


              <View style={{ flex: 1 }}>

            <Text style={SwipingStyles.groupName}>{item.name}</Text>

            {!!item.description && (
              <Text style={SwipingStyles.description}>
                {item.description}
              </Text>
            )}
              </View>
            </View>

            <View style={SwipingStyles.badgeRow}>
              <View style={SwipingStyles.infoBadge}>
                <Text style={{fontStyle: "italic"}}>
                  Jäseniä: {item.memberCount || 0}
                  </Text>
              </View>

              <View style={SwipingStyles.matchBadge}>
                  <Text style={{fontWeight: "bold"}}>
                    Match score: {Math.round((item.score || 0) * 100)}%
                    </Text>
              </View>

              <View style={SwipingStyles.infoBadge}>
                 <Text style={{fontWeight: "bold"}}>
                  Yhteisiä kiinnostuksia: {item.shared_count || 0}
                  </Text>
              </View>
            </View>

            {item.shared_interests?.length > 0 && (
              <View style={SwipingStyles.tagsContainer}>
                {item.shared_interests.slice(0, 3).map((interest, index) => (
                  <View key={index} style={SwipingStyles.tag}>
                    <Text style={SwipingStyles.tagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[
                SwipingStyles.joinButton,
                item.alreadyJoined && SwipingStyles.joinedButton,
              ]}
              onPress={() => {
                if (!item.alreadyJoined) {
                  onJoinGroup(item);
                }
              }}
              disabled={item.alreadyJoined}
            >
              <Text style={SwipingStyles.joinButtonText}>
                {item.alreadyJoined ? "Jo jäsen" : "Liity ryhmään"}
              </Text>
            </TouchableOpacity>
          </View>
          );
})}
      </ScrollView>
      )}
    </View>
  );
}