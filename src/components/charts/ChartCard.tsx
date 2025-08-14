import React from "react";
import { View, Text, ViewStyle, TextStyle } from "react-native";
import { Card } from "../ui/Card";
import { ChartConfig } from "../../types";

export interface ChartCardProps {
  title?: string;
  subtitle?: string;
  config?: ChartConfig;
  isLoading?: boolean;
  error?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  config,
  isLoading = false,
  error,
  style,
  onPress,
}) => {
  const getTitleStyles = (): TextStyle => ({
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  });

  const getSubtitleStyles = (): TextStyle => ({
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  });

  const getPlaceholderStyles = (): ViewStyle => ({
    height: 200,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  });

  const getPlaceholderTextStyles = (): TextStyle => ({
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  });

  const renderChartPlaceholder = () => {
    if (isLoading) {
      return (
        <View style={getPlaceholderStyles()}>
          <Text style={getPlaceholderTextStyles()}>Loading chart data...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={getPlaceholderStyles()}>
          <Text style={[getPlaceholderTextStyles(), { color: "#EF4444" }]}>
            Error loading chart: {error}
          </Text>
        </View>
      );
    }

    if (!config || !config.data.length) {
      return (
        <View style={getPlaceholderStyles()}>
          <Text style={getPlaceholderTextStyles()}>
            {config?.type || "Chart"} visualization will appear here
          </Text>
          <Text
            style={[getPlaceholderTextStyles(), { fontSize: 12, marginTop: 4 }]}
          >
            // TODO manual implementation
          </Text>
        </View>
      );
    }

    // Placeholder for actual chart implementation
    return (
      <View style={getPlaceholderStyles()}>
        <Text style={getPlaceholderTextStyles()}>
          {config.type.toUpperCase()} Chart
        </Text>
        <Text
          style={[getPlaceholderTextStyles(), { fontSize: 12, marginTop: 4 }]}
        >
          {config.data.length} data points
        </Text>
        <Text
          style={[getPlaceholderTextStyles(), { fontSize: 10, marginTop: 8 }]}
        >
          // TODO manual implementation
        </Text>
      </View>
    );
  };

  return (
    <Card style={style} onPress={onPress} variant="elevated">
      {title && <Text style={getTitleStyles()}>{title}</Text>}
      {subtitle && <Text style={getSubtitleStyles()}>{subtitle}</Text>}
      {renderChartPlaceholder()}
    </Card>
  );
};

export {};
