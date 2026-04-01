import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import homeStyles from "../styles/Home";

export default function GroupRecommendationsList({ groups, onJoinGroup }) {
  return (
    <View style={homeStyles.recommendationsContainer}>
      <Text style={homeStyles.recommendationsTitle}>
        Suositellut study groupit
      </Text>

      {!groups || groups.length === 0 ? (
        <Text>Ei ryhmäsuosituksia juuri nyt.</Text>
      ) : (
        groups.map((item) => (
          <View key={item.group_id} style={homeStyles.recommendationCard}>
            <Text style={homeStyles.recommendationName}>{item.name}</Text>

            {!!item.description && <Text>{item.description}</Text>}

            <Text>Jäseniä: {item.memberCount || 0}</Text>
            <Text>Match score: {Math.round((item.score || 0) * 100)}%</Text>
            <Text>Yhteisiä kiinnostuksia: {item.shared_count || 0}</Text>

            {item.shared_interests?.length > 0 && (
              <Text>{item.shared_interests.join(", ")}</Text>
            )}

            <TouchableOpacity
              style={homeStyles.actionButton}
              onPress={() => onJoinGroup(item)}
            >
              <Text style={homeStyles.actionButtonText}>Liity ryhmään</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}