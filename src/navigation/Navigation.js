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

import NavbarTop from "../components/NavbarTop";
import NavbarBottom from "../components/NavbarBottom";

import { useUser } from "../context/UserContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const user = useUser();

  const withNavBars = (Component, options = {}) => (props) => (
  <View style={styles.container}>
    <NavbarTop showBack={options.showBack} showProfile={options.showProfile} />
    <View style={styles.content}>
      <Component {...props} />
    </View>
    <NavbarBottom />
  </View>
);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
          {/*Screens with bottom navbar */}
            <Stack.Screen name="Home" component={withNavBars(HomeScreen, { showProfile: true })} />
            <Stack.Screen name="Swiping" component={withNavBars(Swiping)} />

          {/*Screens with bottom navbar and back arrow */}
            <Stack.Screen name="PrivaChats" component={withNavBars(PrivaChats, { showBack: true })} />
            <Stack.Screen name="GroupsScreen" component={withNavBars(GroupsScreens, { showBack: true })} />

          {/*Screens with only back arrow */}
            <Stack.Screen name="SpecificChat" component={withNavBars(SpecificChat, { showBack: true })} />
            <Stack.Screen name="Profile" component={withNavBars(ProfileScreen, { showBack: true })} />

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