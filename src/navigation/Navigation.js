import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import SpecificChat from "../screens/SpecificChat";
import ProfileScreen from "../screens/ProfileScreen";
import PrivaChats from "../screens/PrivaChats";
import BottomTabs from "./BottomTabs";

import { useUser } from "../context/UserContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const user = useUser();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            {/* 🔽 MAIN (Tabs) */}
            <Stack.Screen
              name="Main"
              component={BottomTabs}
              options={({ navigation }) => ({
                headerTitle: "",

                // 👤 Profiili oikeaan yläkulmaan
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Profile")}
                  >
                    <Ionicons
                      name="person-circle-outline"
                      size={28}
                      style={{ marginRight: 15 }}
                    />
                  </TouchableOpacity>
                ),
              })}
            />

            {/* 💬 PRIVA CHATS (TOP HEADER + BACK) */}
            <Stack.Screen
              name="Chats"
              component={PrivaChats}
              options={({ navigation }) => ({
                headerTitle: "",

                // ⬅️ BACK vasemmalle top navbarissa
                headerLeft: () => (
                  <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      style={{ marginLeft: 10 }}
                    />
                  </TouchableOpacity>
                ),
              })}
            />

            {/* 👤 PROFILE */}
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerTitle: "" }}
            />

            {/* 💬 SINGLE CHAT */}
            <Stack.Screen
              name="SpecificChat"
              component={SpecificChat}
              options={({ navigation }) => ({
                headerTitle: "",

                headerLeft: () => (
                  <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      style={{ marginLeft: 10 }}
                    />
                  </TouchableOpacity>
                ),
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
  );
}