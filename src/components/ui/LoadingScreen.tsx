/**
 * Loading Screen Component
 * Simple loading screen for navigation transitions
 */

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
}) => {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#007AFF" />
      <Text className="text-base text-gray-600 mt-4">{message}</Text>
    </View>
  );
};

export default LoadingScreen;
