import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  hobbies: {
    marginTop: 8,
    color: "#444",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  info: {
    marginTop: 12,
    color: "#666",
    fontWeight: "600",
  },
});

export default styles;