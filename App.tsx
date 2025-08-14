import React from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import "./global.css";

export default function App() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-xl font-bold text-gray-900">SelfPay</Text>
      <Text className="text-base text-gray-600 mt-2">
        Week 1 Sprint - Foundation
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

export {};
