import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 220,
    flexGrow: 1,
  },
  loadingContainer: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  friendButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  friendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pendingText: {
    color: "#999",
    marginTop: 8,
  },
  declinedText: {
    color: "#aaa",
    marginTop: 8,
  },
  friendText: {
    color: "green",
    marginTop: 8,
    fontWeight: "600",
  },
  debugText: {
    marginTop: 6,
    color: "#666",
  },
});

export default styles;