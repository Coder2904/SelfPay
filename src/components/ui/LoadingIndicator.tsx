import React from "react";
import { View, Text, ViewStyle, TextStyle } from "react-native";
import { LoadingSpinner } from "./LoadingSpinner";

export interface LoadingIndicatorProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
  fullScreen?: boolean;
  transparent?: boolean;
  style?: ViewStyle;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Loading...",
  size = "large",
  color = "#3B82F6",
  fullScreen = false,
  transparent = false,
  style,
}) => {
  const getContainerStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    };

    if (fullScreen) {
      return {
        ...baseStyles,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: transparent ? "rgba(255, 255, 255, 0.8)" : "#FFFFFF",
        zIndex: 1000,
      };
    }

    return {
      ...baseStyles,
      backgroundColor: transparent ? "transparent" : "#FFFFFF",
    };
  };

  const getMessageStyles = (): TextStyle => ({
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  });

  return (
    <View style={[getContainerStyles(), style]}>
      <LoadingSpinner size={size} color={color} />
      {message && <Text style={getMessageStyles()}>{message}</Text>}
    </View>
  );
};

export {};
