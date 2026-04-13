
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scroll: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "monospace",
    marginBottom: 20,
    alignSelf: "center",
  },

  card: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginRight: 14,
    marginLeft: 10,
    marginBottom: 20,
    shadowColor: "#000",
    elevation: 3,
  },

   avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#d9e8ff",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },

   avatarLetter: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c5aa0",
  },

  groupName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },

  description: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  infoBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

   matchBadge: {
    backgroundColor: "#dff4e7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

   tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },

  tag: {
    backgroundColor: "#eef3ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },

  tagText: {
    fontSize: 12,
    color: "#355caa",
    fontWeight: "600",
  },

   joinButton: {
    backgroundColor: "#F99D11",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
  },

  joinedButton: {
    backgroundColor: "#999",
  },

  joinButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  infoText: {
    fontSize: 16,
    color: "#666",  
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 220,
    flexGrow: 1,
  },

  actionButton: {
    backgroundColor: "#F99D11",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },

  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  SwipeButton: {
    backgroundColor: "#F99D11",
    padding: 12,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 40,
  },

  userName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
    color: "#222",
  },

  cityText: {
    fontSize: 13,
    color: "#666",
  },

  actionButtonSpacing: {
    marginTop: 4,
    marginBottom: 4,
  },

 debugText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
  },

  statusBoxPending: {
    marginTop: 6,
    backgroundColor: "#fff4d6",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },

  pendingText: {
    color: "#9a6b00",
    fontWeight: "700",
    fontSize: 13,
  },

  statusBoxDeclined: {
    marginTop: 6,
    backgroundColor: "#fde2e2",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },

  declinedText: {
    color: "#b42318",
    fontWeight: "700",
    fontSize: 13,
  },

  statusBoxAccepted: {
    marginTop: 6,
    backgroundColor: "#dff4e7",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },

  acceptedText: {
    color: "#217a4b",
    fontWeight: "700",
    fontSize: 13,
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
  friendText: {
    color: "green",
    marginTop: 8,
    fontWeight: "600",
  },
 
});

export default styles;