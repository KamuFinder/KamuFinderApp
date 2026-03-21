import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { View, StyleSheet  } from "react-native";

import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import SpecificChat from "../screens/SpecificChat";
import ProfileScreen from "../screens/ProfileScreen";
import PrivaChats from "../screens/PrivaChats";
import GroupsScreens from "../screens/GroupsScreen"
import Swiping from "../screens/Swiping"
import HomeScreen from "../screens/HomeScreen";

import BackArrow from "../components/backArrow";
import NavbarBottom from "../components/NavbarBottom";

import { useUser } from "../context/UserContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const user = useUser();

  const withNavbar = (Component) => (props) => (
    <View style={styles.container}>
      <View style={styles.content}>
        <Component {...props} />
      </View>
      <NavbarBottom />
    </View>
  );

  const withBackArrow = (Component) => (props) => (
  <View style={styles.container}>
    <Component {...props} />
    <BackArrow />
  </View>
);



  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
          {/*Screens with bottom navbar */}
            <Stack.Screen name="Home" component={withNavbar(HomeScreen)} />
            <Stack.Screen name="Swiping" component={withNavbar(Swiping)} />

          {/*Screens with bottom navbar and back arrow */}
            <Stack.Screen name="PrivaChats" component={withNavbar(withBackArrow(PrivaChats))} />
            <Stack.Screen name="GroupsScreen" component={withNavbar(withBackArrow(GroupsScreens))} />

          {/*Screens with only back arrow */}
            <Stack.Screen name="SpecificChat" component={withBackArrow(SpecificChat)} />
            <Stack.Screen name="Profile" component={withBackArrow(ProfileScreen)} />

          </>
        ) : (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});