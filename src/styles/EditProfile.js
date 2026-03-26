import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  title: {
    justifyContent: "flex-start",
    paddingTop: 20,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },

    inputContainer: {
        width: "80%",
        marginTop: 30,
        marginBottom: 20,
    },

    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#555",
        marginBottom: 8,
        marginTop: 16,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        backgroundColor: "#b1b1b1",
        paddingHorizontal: 10,
        paddingVertical: 12,
    }

});
