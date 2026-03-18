import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  // 🔹 Titles
  title: {
    fontSize: 32, // Welcome tyylin fontti
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#555",
  },

  // 🔹 Inputit
  input: {
    backgroundColor: "#b1b1b1",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: "80%",
  },

  // 🔹 Nappityylit
  button: {
    backgroundColor: "#2196F3", // Kirjaudu sisään
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: "80%",
    alignItems: "center",
  },
  signupButton: {
    backgroundColor: "#4CAF50", // Luo käyttäjä nappi, sama kuin WelcomeScreenin väri
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: "80%",
    alignItems: "center",
  },

  // 🔹 Tekstit
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "blue",
  },
});