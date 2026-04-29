import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
  card: {
    position: "absolute",
    width: "90%",
    height: "98%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    elevation: 5,
    alignItems: "center",
  },

  pressableContent: {
  flex: 1,
  width: "100%",
  alignItems: "center",
},

  imageWrapper: {
   width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddd",
    marginBottom: 12,
    marginTop: 20,
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111",
    textAlign: "center",
  },

  fullName: {
    fontSize: 15,
    color: "#777",
    marginTop: 3,
    textAlign: "center",
  },

  hobbies: {
    marginTop: 8,
    color: "#444",
    fontSize: 14,
  },

   city: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
  },

  bio: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 16,
    paddingHorizontal: 8,
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    height: 60,
    overflow: "hidden",
  },

  tag: {
    backgroundColor: "#FFE8D6",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    maxHeight:"45%",
  },

  tagText: {
    color: "#D96C06",
    fontSize: 10,
    fontWeight: "600",
  },

  moreTag: {
  backgroundColor: "#F28C28",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
},

moreTagText: {
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: "700",
},

  button: {
    width: "60%",
    marginTop: 14,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
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