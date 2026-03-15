import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./src/screens/WelcomeScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ title: "Tervetuloa" }}
        />

        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: "Kirjaudu sisään" }}
        />

        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: "Luo käyttäjä" }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}