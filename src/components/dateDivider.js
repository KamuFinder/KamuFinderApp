import React from "react";
import { View, Text } from "react-native";

const getDayLabel = (date) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  if (isSameDay(date, today)) return "Tänään";
  if (isSameDay(date, yesterday)) return "Eilen";

  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

export default function DateDivider({ date }) {
  return (
    <View
      style={{
        alignSelf: "center",
        backgroundColor: "#e0e0e0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginVertical: 10,
      }}
    >
      <Text style={{ fontSize: 12, color: "#444", fontWeight: "bold" }}>
        {getDayLabel(date)}
      </Text>
    </View>
  );
}