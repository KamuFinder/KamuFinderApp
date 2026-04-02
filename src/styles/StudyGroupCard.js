import { StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },

  metaText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },

  tags: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 8,
  },

  button: {
    marginTop: 14,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});