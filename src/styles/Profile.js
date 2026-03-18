import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
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
  }
  });