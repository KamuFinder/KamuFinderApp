import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  messageContainer: {
    maxWidth: "75%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom:10,
  },

  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff",
    borderBottomRightRadius: 2,
  },

  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f0f0",
    borderBottomLeftRadius: 2,
  },

  messageText: {
    fontSize: 16,
    color: "#000",
  },

  messageTime: {
    fontSize: 11,
    color: "#555",
    marginTop: 5,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 50,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});