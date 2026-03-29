import React from "react";
import { View, Text } from "react-native";
import homeStyles from "../styles/Home";

export default function GroupRecommendationsList({ groupRecommendations }) {
  return (
    <View style={homeStyles.recommendationsContainer}>
      <Text style={homeStyles.recommendationsTitle}>
        Suositellut kaveriryhmät
      </Text>

      {groupRecommendations.length === 0 ? (
        <Text>Ei ryhmäsuosituksia juuri nyt.</Text>
      ) : (
        groupRecommendations.map((item) => (
          <View key={item.group_id} style={homeStyles.recommendationCard}>
            <Text style={homeStyles.recommendationName}>{item.group_name}</Text>
            <Text>{item.description}</Text>
            <Text>Jäseniä: {item.member_count}</Text>
            <Text>Match score: {Math.round(item.score * 100)}%</Text>
          </View>
        ))
      )}
    </View>
  );
}