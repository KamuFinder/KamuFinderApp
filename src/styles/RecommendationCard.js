import { StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  city: {
    color: "#666",
    marginBottom: 6,
  },
  match: {
    fontWeight: "600",
    marginBottom: 6,
  },
  hobbies: {
    color: "#333",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});