import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  helloUser: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  text: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },

  buttonText: {
    fontSize: 40,
    color: "red",
    marginVertical: 10,
  },

  /* 👤 Profiili (yläkulma) */
  profileButton: {
    position: "absolute",
    top: 50,
    right: 20,
  },

  /* 💬 Keskustelut (floating button) */
  chatButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 30,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});