import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  loadingText: {
    marginTop: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  reloadButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  reloadButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  deckWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  skipButton: {
    backgroundColor: "#999",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  likeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default styles;