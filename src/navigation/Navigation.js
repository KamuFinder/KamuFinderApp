import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import HomeScreen from "../screens/HomeScreen.js";
import ProfileScreen from "../screens/ProfileScreen.js";
import { useUser } from "../context/UserContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const user = useUser();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <>
            {/* 🔥 SignIn nyt aloitusruutu */}
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}