import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import PrivaChats from "../screens/PrivaChats";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
        },
      }}
    >
      {/* ☀️ Aurinkokuvaan ryhmät */}
      <Tab.Screen
        name="Group"
        component={View}
        options={{
          tabBarIcon: () => (
            <Ionicons name="sunny-outline" size={24} color="black" /> /* Tähä sitte ne ryhmät */
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} disabled />
          ),
        }}
      />

      {/* 🏠 Home */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "card" : "home-outline"} /* Kortti näkyy ku ollaan HomeScreenissä siihe tulee se swaippailu*/
              size={24}
              color={focused ? "#4CAF50" : color}
            />
          ),
          tabBarButton: (props) => {
            const isFocused = props.accessibilityState?.selected;

            return (
              <TouchableOpacity
                {...props}
                disabled={isFocused}
                onPress={() => {
                  if (!isFocused) navigation.navigate("Home");
                }}
              />
            );
          },
        })}
      />

      {/* 💬 Chats */}
      <Tab.Screen
        name="Chats"
        component={PrivaChats}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-outline" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}