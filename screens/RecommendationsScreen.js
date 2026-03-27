import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, firestore, USERS } from "../src/firebase/config";
import { fetchUserRecommendations } from "../services/recommendationService";

export default function RecommendationsScreen() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentUser = auth.currentUser;

        if (!currentUser) {
          throw new Error("Käyttäjää ei ole kirjautuneena");
        }

        const currentUserId = currentUser.uid;

        const currentUserRef = doc(firestore, USERS, currentUserId);
        const currentUserSnap = await getDoc(currentUserRef);

        if (!currentUserSnap.exists()) {
          throw new Error("Nykyisen käyttäjän dokumenttia ei löytynyt");
        }

        const currentUserData = currentUserSnap.data();

        const usersSnapshot = await getDocs(collection(firestore, USERS));

        const candidates = usersSnapshot.docs
          .map((userDoc) => {
            const data = userDoc.data();

            return {
              user_id: userDoc.id,
              firstName: data.firstName || "",
              city: data.city || "",
              hobby_interests: Array.isArray(data.hobby_interests)
                ? data.hobby_interests
                : [],
            };
          })
          .filter((user) => user.user_id !== currentUserId);

        const result = await fetchUserRecommendations(
          currentUserId,
          Array.isArray(currentUserData.hobby_interests)
            ? currentUserData.hobby_interests
            : [],
          candidates
        );

        setRecommendations(result);
      } catch (err) {
        setError(err.message || "Tuntematon virhe");
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>Haetaan suosituksia...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Virhe: {error}</Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>Ei vielä suosituksia.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={recommendations}
      keyExtractor={(item) => item.user_id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.firstName || "Tuntematon"}</Text>
          <Text style={styles.text}>{item.city || "Ei kaupunkia"}</Text>
          <Text style={styles.text}>
            Match: {Math.round(item.score * 100)}%
          </Text>
          <Text style={styles.text}>
            Yhteisiä harrastuksia: {item.shared_count || 0}
          </Text>

          {item.shared_hobbies && item.shared_hobbies.length > 0 && (
            <Text style={styles.text}>
              {item.shared_hobbies.join(", ")}
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  list: {
    padding: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
});