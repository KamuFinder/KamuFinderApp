import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingBottom: 90,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 95,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    paddingTop: 12,
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
    marginTop: 10,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 14,
    paddingTop: 12,
    paddingBottom: 30,
  },
  skipButton: {
    flex: 1,
    height: 54,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#F0C9A4",
    alignItems: "center",
    justifyContent: "center",
  },

  likeButton: {
    flex: 1,
    height: 54,
    borderRadius: 999,
    backgroundColor: "#F28C28",
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    color: "#9A5A20",
    fontSize: 16,
    fontWeight: "700",
  },

  likeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});

export default styles;