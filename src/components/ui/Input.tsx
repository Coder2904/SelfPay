import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from "react-native";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
  variant?: "default" | "filled" | "outline";
  size?: "small" | "medium" | "large";
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isRequired = false,
  variant = "outline",
  size = "medium",
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 8,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
      medium: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
      large: { paddingHorizontal: 20, paddingVertical: 16, minHeight: 52 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: "transparent",
        borderBottomWidth: 1,
        borderBottomColor: isFocused ? "#3B82F6" : "#D1D5DB",
        borderRadius: 0,
      },
      filled: {
        backgroundColor: "#F3F4F6",
        borderWidth: 0,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: error ? "#EF4444" : isFocused ? "#3B82F6" : "#D1D5DB",
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getInputStyles = (): TextStyle => {
    return {
      flex: 1,
      fontSize: size === "small" ? 14 : size === "large" ? 18 : 16,
      color: "#111827",
      paddingHorizontal: leftIcon || rightIcon ? 8 : 0,
    };
  };

  const getLabelStyles = (): TextStyle => {
    return {
      fontSize: 14,
      fontWeight: "500",
      color: "#374151",
      marginBottom: 4,
    };
  };

  const getHelperTextStyles = (): TextStyle => {
    return {
      fontSize: 12,
      color: error ? "#EF4444" : "#6B7280",
      marginTop: 4,
    };
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={getLabelStyles()}>
          {label}
          {isRequired && <Text style={{ color: "#EF4444" }}> *</Text>}
        </Text>
      )}

      <View style={getContainerStyles()}>
        {leftIcon && leftIcon}
        <TextInput
          style={[getInputStyles(), style]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {rightIcon && rightIcon}
      </View>

      {(error || helperText) && (
        <Text style={getHelperTextStyles()}>{error || helperText}</Text>
      )}
    </View>
  );
};

export {};
