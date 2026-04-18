import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,   
        padding: 20,
        backgroundColor: "#fff",
    },

        title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        alignSelf: "flex-start",
    },

    logo:{
        width: 120,
        height: 120,
        marginBottom: 20,
        alignSelf: "center",
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

    messageContainer: {
        flex: 1,
        marginLeft: 12,
    },

    messageHeader: {
        fontSize: 16,
        fontWeight: "bold",
        paddingVertical: 5,
        paddingHorizontal: 10,
    },

    messageTime: {
        color: "#555",
        fontSize: 16,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
    },
    message: {
        marginTop: 5,
        color: "#555",
        paddingHorizontal: 10,

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