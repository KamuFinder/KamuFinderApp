import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  logo:{
    width: 120,
    height: 120,
    marginBottom: 20,
    alignSelf: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "medium",
    fontFamily: "monospace",
    marginBottom: 20,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    
  },
  groupItem: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    padding: 20,
    marginBottom: 10,
    borderRadius: 5,
  },

  iconMessage: {
    padding: 8,
  },

  modalOverlay: { 
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // tumma blur-tyylinen tausta
    justifyContent: "center",
    alignItems: "center",
  },
  
  modalContainer: {
    width: "90%",
    maxHeight: "85%", 
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },


});