import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
  card: {
    position: "absolute",
    width: width * 0.82,
    height: height * 0.5,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  image: {
    width: "100%",
    height: "42%",
    backgroundColor: "#eaeaea",
  },

  content: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-start",
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111",
  },

  hobbies: {
    marginTop: 8,
    color: "#444",
    fontSize: 14,
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
  },

  info: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },

  likeText: {
    position: "absolute",
    top: 24,
    left: 18,
    fontSize: 28,
    fontWeight: "800",
    color: "#27AE60",
    zIndex: 50,
    transform: [{ rotate: "-15deg" }],
  },

  skipText: {
    position: "absolute",
    top: 24,
    right: 18,
    fontSize: 28,
    fontWeight: "800",
    color: "#EB5757",
    zIndex: 50,
    transform: [{ rotate: "15deg" }],
  },
});