import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { firestore } from "../firebase/config";

import WelcomeScreen from "../screens/WelcomeScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import HomeScreen from "../screens/HomeScreen.js";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {

  const [logged, setLogged] = useState(false);

  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: "Tervetuloa" }}/>

            <Stack.Screen name="SignIn" options={{ title: "Kirjaudu sisään" }}>
              {props => <SignInScreen {...props} setLogged={setLogged} />}
            </Stack.Screen>
            
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Luo käyttäjä" }}/>

            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Koti" }}/>

            
        </Stack.Navigator>
    </NavigationContainer>
  );
}