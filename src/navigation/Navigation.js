import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import SpecificChat from "../screens/SpecificChat";
import ProfileScreen from "../screens/ProfileScreen";
import PrivaChats from "../screens/PrivaChats";
import GroupsScreens from "../screens/GroupsScreen";
import Swiping from "../screens/Swiping";
import SwipePeopleScreen from "../screens/SwipePeopleScreen";
import HomeScreen from "../screens/HomeScreen";
import Notifications from "../screens/Notifications";
import SpecificGroupChat from "../screens/SpecificGroupChat";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";

import NavbarTop from "../components/NavbarTop";
import NavbarBottom from "../components/NavbarBottom";

import { useUser } from "../context/UserContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const user = useUser();

  const withNavBars = (Component, options = {}) => {
    return function WrappedScreen(props) {
      return (
        <View style={styles.container}>
          <NavbarTop
            showBack={options.showBack}
            showProfile={options.showProfile}
            showNotifications={options.showNotifications}
          />
          <View style={styles.content}>
            <Component {...props} />
          </View>
          {options.showBottom !== false && <NavbarBottom />}
        </View>
      );
    };
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen
                name="Home"
                component={withNavBars(HomeScreen, {
                  showProfile: true,
                  showNotifications: true,
                })}
              />
              <Stack.Screen
                name="Swiping"
                component={withNavBars(Swiping)}
              />
              <Stack.Screen
                name="SwipePeople"
                component={withNavBars(SwipePeopleScreen, {
                  showBack: true,
                })}
              />
              <Stack.Screen
                name="PrivaChats"
                component={withNavBars(PrivaChats, {
                  showBack: true,
                  showProfile: true,
                })}
              />
              <Stack.Screen
                name="GroupsScreen"
                component={withNavBars(GroupsScreens, {
                  showBack: true,
                  showProfile: true,
                })}
              />
              <Stack.Screen
                name="Profile"
                component={withNavBars(ProfileScreen, {
                  showBack: true,
                })}
              />
              <Stack.Screen
                name="SpecificGroupChat"
                component={withNavBars(SpecificGroupChat, {
                  showBack: true,
                  showBottom: false,
                })}
              />
              <Stack.Screen
                name="SpecificChat"
                component={withNavBars(SpecificChat, {
                  showBack: true,
                  showBottom: false,
                })}
              />
              <Stack.Screen
                name="Notifications"
                component={withNavBars(Notifications, {
                  showBack: true,
                  showBottom: false,
                })}
              />
              <Stack.Screen
                name="EditProfile"
                component={withNavBars(EditProfileScreen, {
                  showBack: true,
                  showBottom: false,
                })}
              />
              <Stack.Screen
                name="ChangePassword"
                component={withNavBars(ChangePasswordScreen, {
                  showBack: true,
                  showBottom: false,
                })}
              />
            </>
          ) : (
            <>
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});