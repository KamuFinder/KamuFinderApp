import React from "react";
import AppNavigator from "./src/navigation/Navigation.js";
import { AuthProvider } from "./src/context/UserContext.js";

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
// Onko tää tarkotuksella että logaa api avaimen? / tarvitteeko joku tätä
console.log("API KEY:", API_KEY);

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}