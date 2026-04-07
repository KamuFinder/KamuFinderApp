import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../styles/StudyGroupCard";

export default function StudyGroupCard({ group, onJoin }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{group?.name || "Tuntematon ryhmä"}</Text>

      {!!group?.description && (
        <Text style={styles.description}>{group.description}</Text>
      )}

      <Text style={styles.metaText}>
        Match: {Math.round((group?.score || 0) * 100)}%
      </Text>

      <Text style={styles.metaText}>
        Yhteisiä kiinnostuksia: {group?.shared_count || 0}
      </Text>

      <Text style={styles.metaText}>
        Jäseniä: {group?.memberCount || 0}
      </Text>

      {group?.shared_interests?.length > 0 && (
        <Text style={styles.tags}>
          {group.shared_interests.join(", ")}
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => onJoin(group)}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Liity ryhmään</Text>
      </TouchableOpacity>
    </View>
  );
}