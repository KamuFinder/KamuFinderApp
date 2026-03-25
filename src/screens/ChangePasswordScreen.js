import React from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, 
  KeyboardAvoidingView, Platform } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function ChangePasswordScreen() {
    return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>Change Password Screen</Text>
    </View>
    );
}