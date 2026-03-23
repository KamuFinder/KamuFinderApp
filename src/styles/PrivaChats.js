import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    chatItem: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: "#f5f5f5",
    },
    unread: {
        backgroundColor: "#cce5ff",
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
    },
    message: {
        marginTop: 5,
        color: "#555",
    },
    bottomHomeButton: {
        position: "absolute",
        bottom: 20,
        alignSelf: "center",
        alignItems: "center",
      },
      
      homeText: {
        color: "red",
        marginTop: 5,
        fontSize: 14,
      },
});