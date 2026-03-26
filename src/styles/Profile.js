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
    backgroundColor: "red",
    fontWeight: "bold",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderColor: "red",
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

  modalContainer: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: 'white' 
  },
  modalTitle: { 
    fontSize: 24, 
    marginBottom: 20 
  },
  modalItem: { 
    fontSize: 18, 
    marginVertical: 5 
  },
  modalClose: { 
    fontSize: 18, 
    color: 'red', 
    marginTop: 20, 
    textAlign: 'center' 
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