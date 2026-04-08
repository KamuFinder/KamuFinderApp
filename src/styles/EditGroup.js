import { StyleSheet } from "react-native";

export default StyleSheet.create({

  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  avatarBox: {
    marginBottom: 12,
    alignItems: "flex-start",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#f17a0a",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#eee",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  secondaryButtonText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#d62828",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 64,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  memberRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  removeMemberButton: {
    backgroundColor: "#ffe5e5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 12,
},

  removeMemberButtonText: {
    color: "#c62828",
    fontWeight: "bold",
    fontSize: 14,
},
  memberLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
  },
  memberRole: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    maxHeight: "75%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  friendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  disabledFriendRow: {
    opacity: 0.6,
  },

  leaveButton: {
    backgroundColor: "#d62828",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
},

  leaveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
},
});
