import React from "react";
import { View } from "react-native";

export default function Divider({
  thickness = 1,
  color = "#ddd",
  marginVertical = 10,
  width = "100%",
}) {
  return (
    <View
      style={{
        height: thickness,
        backgroundColor: color,
        width: width,
        alignSelf: "center",
        marginVertical: marginVertical,
      }}
    />
  );
}