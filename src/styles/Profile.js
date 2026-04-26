import { signOut } from "firebase/auth";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  header: {
    width: "100%",
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal:10,
  },

  menuOverlay: {
    flex:1,
    alignItems:"flex-end",
    paddingTop:90,
    paddingRight:15,
  },

  dropdown:{
    backgroundColor: "#fff",
    flexDirection: "column",
    borderRadius: 16,
    width: 200,
    paddingVertical: 32,
    paddingHorizontal: 16,
    elevation: 5,
  },

  dropdownItem: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: "#F99D11",
  },

  dropdownItemText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },

  signOut: {
    color: "white",
    backgroundColor: "#F99D11",
    fontWeight: "bold",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderColor: "#F99D11",
    borderWidth: 1,
    borderRadius: 20,
    textAlign: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },

  infoContainer: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 10,
    //backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
    
  },

  infoContainer2: {
    width: "100%",
    paddingVertical: 10,
    alignItems: "left",
  },

  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  justifyContent: "center",
  alignItems: "center",
},
  modalContainer: { 
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    padding: 20,
   borderRadius:16,
    
  },
  modalTitle: { 
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  friendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },

  friendInfo: {
    flex: 1,
    marginRight: 10,
  },

  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  friendDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
 
  modalClose: { 
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },

  closeButton: {
    marginTop: 20,
    backgroundColor: "#f17a0a",
    padding: 12,
    borderRadius: 8,
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