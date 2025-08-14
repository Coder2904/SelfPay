import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data available",
  message = "There is nothing to display at the moment.",
  icon,
  actionLabel,
  onAction,
  style,
}) => {
  const getContainerStyles = (): ViewStyle => ({
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    ...style,
  });

  const getIconContainerStyles = (): ViewStyle => ({
    marginBottom: 16,
    opacity: 0.6,
  });

  const getTitleStyles = (): TextStyle => ({
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  });

  const getMessageStyles = (): TextStyle => ({
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: actionLabel ? 24 : 0,
  });

  const getActionButtonStyles = (): ViewStyle => ({
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  });

  const getActionButtonTextStyles = (): TextStyle => ({
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  });

  const renderDefaultIcon = () => (
    <View
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          color: "#9CA3AF",
        }}
      >
        📭
      </Text>
    </View>
  );

  return (
    <View style={getContainerStyles()}>
      <View style={getIconContainerStyles()}>
        {icon || renderDefaultIcon()}
      </View>

      <Text style={getTitleStyles()}>{title}</Text>
      <Text style={getMessageStyles()}>{message}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity style={getActionButtonStyles()} onPress={onAction}>
          <Text style={getActionButtonTextStyles()}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export {};
