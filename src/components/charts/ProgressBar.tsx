import React from "react";
import { View, Text, ViewStyle, TextStyle } from "react-native";

export interface ProgressBarProps {
  progress: number; // 0 to 1
  label?: string;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  color = "#3B82F6",
  backgroundColor = "#E5E7EB",
  height = 8,
  animated = true,
  style,
}) => {
  // Ensure progress is between 0 and 1
  const normalizedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(normalizedProgress * 100);

  const getContainerStyles = (): ViewStyle => ({
    marginVertical: 8,
    ...style,
  });

  const getLabelContainerStyles = (): ViewStyle => ({
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  });

  const getLabelStyles = (): TextStyle => ({
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  });

  const getPercentageStyles = (): TextStyle => ({
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  });

  const getTrackStyles = (): ViewStyle => ({
    height,
    backgroundColor,
    borderRadius: height / 2,
    overflow: "hidden",
  });

  const getFillStyles = (): ViewStyle => ({
    height: "100%",
    backgroundColor: color,
    borderRadius: height / 2,
    width: `${percentage}%`,
  });

  return (
    <View style={getContainerStyles()}>
      {(label || showPercentage) && (
        <View style={getLabelContainerStyles()}>
          {label && <Text style={getLabelStyles()}>{label}</Text>}
          {showPercentage && (
            <Text style={getPercentageStyles()}>{percentage}%</Text>
          )}
        </View>
      )}

      <View style={getTrackStyles()}>
        <View style={getFillStyles()} />
      </View>
    </View>
  );
};

export {};
