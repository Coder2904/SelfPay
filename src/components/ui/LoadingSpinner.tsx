import React from "react";
import {
  View,
  ActivityIndicator,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native";

export interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  message?: string;
  overlay?: boolean;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color = "#3B82F6",
  message,
  overlay = false,
  style,
}) => {
  const getContainerStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      alignItems: "center",
      justifyContent: "center",
    };

    if (overlay) {
      return {
        ...baseStyles,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        zIndex: 1000,
      };
    }

    return {
      ...baseStyles,
      padding: 20,
    };
  };

  const getMessageStyles = (): TextStyle => {
    return {
      marginTop: 12,
      fontSize: 16,
      color: "#6B7280",
      textAlign: "center",
    };
  };

  return (
    <View style={[getContainerStyles(), style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={getMessageStyles()}>{message}</Text>}
    </View>
  );
};

export {};
