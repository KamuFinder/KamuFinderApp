import React from "react";
import AppNavigator from "./src/navigation/Navigation.js";
import { AuthProvider } from "./src/context/UserContext.js";


export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}