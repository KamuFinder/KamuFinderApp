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

  aiButton: {
   backgroundColor: "#1f6feb",
   padding: 14,
   borderRadius: 10,
   marginTop: 20,
   alignItems: "center",
  },
  aiButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  // AI-suositukset
  actionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
    width: "80%",
    alignItems: "center",
  },

  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
recommendationsContainer: {
  width: "100%",
  marginTop: 20,
},

recommendationsTitle: {
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 10,
  textAlign: "center",
},

recommendationCard: {
  backgroundColor: "#f5f5f5",
  padding: 15,
  borderRadius: 10,
  marginBottom: 10,
  width: "100%",
},

recommendationName: {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 5,
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
  },

   floatingWrapper: {
    position: "absolute",
    right: 20,
    bottom: 100,
    zIndex: 999,
    elevation: 20,
  },

  aiButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  speechBubble: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomRightRadius: 2,
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginRight: 0,
    maxWidth: 180,
    shadowColor: "#000",
    elevation: 4,
    bottom: 80,
  },

  speechText: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
  },

  aiCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F99D11",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    bottom:30,
  },

  aiIcon: {
    fontSize: 30,
    

  },
});