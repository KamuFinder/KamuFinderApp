import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
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
    paddingHorizontal: 10,
    marginBottom: 40,
    textAlign: "center",
    fontFamily:"monospace",
  },

  logoContainer: {
    marginBottom: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },

  logo:{
    width: 120,
    height: 120,
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

  searchContainer:{
    width: "80%",
    alignItems: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    borderColor: "#F99D11",
    borderWidth: 2,
    paddingHorizontal: 10,
    height: 50,
    elevation: 3, // Android shadow
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
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


  friendReguestbutton: {
    flexDirection: "row",         
    justifyContent: "space-between", 
    alignItems: "center",
  }
});