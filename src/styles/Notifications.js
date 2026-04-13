import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
     backgroundColor: "#fff",
  },

    title: {
        paddingTop: 20,
        marginBottom: 32,
        fontSize: 24,
        fontWeight: "bold",
        color: "#333333",
    },

      subTitle: {
         fontSize: 18,
          fontWeight: "700",
          color: "#333",
          marginTop: 14,
          marginBottom: 10,
      },

     card: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#eee",
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
  },

  unreadCard: {
    backgroundColor: "#fff3e8",
    borderColor: "#f17a0a",
  },

  readCard: {
    backgroundColor: "#f6f6f6",
    borderColor: "#e5e5e5",
  },

   pendingCard: {
    backgroundColor: "#fff",
    borderColor: "#f0d2b0",
  },

  notificationCard: {
    backgroundColor: "#fff7e8",
    borderColor: "#f6c27a",
  },

  highlightCard: {
    backgroundColor: "#fff4fb",
    borderColor: "#c86bb6",
    borderWidth: 2,
  },

  highlightTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8a2d78",
    marginBottom: 8,
  },


  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },

  cardText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 20,
  },

  dateText: {
    fontSize: 12,
    color: "#888",
    marginTop: 10,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  acceptButton: {
    backgroundColor: "#f17a0a",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },

  acceptButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  declineButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#f60a0a",
  },

  declineButtonText: {
    color: "#555",
    fontWeight: "600",
  },

  deleteButton: {
    marginTop: 14,
    backgroundColor: "#fff0f0",
    borderWidth: 1,
    borderColor: "#e3a1a1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignSelf: "flex-start",
  },

  deleteButtonText: {
    color: "#c0392b",
    fontWeight: "700",
  },

  navigateButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#f17a0a",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
  },

  navigateButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
   

});