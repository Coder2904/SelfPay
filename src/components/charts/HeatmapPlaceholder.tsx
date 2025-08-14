import React from "react";
import { View, Text, ViewStyle, TextStyle } from "react-native";
import { Card } from "../ui/Card";

export interface HeatmapPlaceholderProps {
  title?: string;
  width?: number;
  height?: number;
  gridSize?: number;
  isLoading?: boolean;
  error?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

export const HeatmapPlaceholder: React.FC<HeatmapPlaceholderProps> = ({
  title = "Surge Heatmap",
  width = 300,
  height = 200,
  gridSize = 8,
  isLoading = false,
  error,
  style,
  onPress,
}) => {
  const getTitleStyles = (): TextStyle => ({
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  });

  const getHeatmapContainerStyles = (): ViewStyle => ({
    width,
    height,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  });

  const getGridStyles = (): ViewStyle => ({
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    height: "100%",
  });

  const getCellStyles = (intensity: number): ViewStyle => {
    const cellSize = (width - 32) / gridSize;
    const opacity = 0.1 + intensity * 0.8; // 0.1 to 0.9 opacity

    return {
      width: cellSize,
      height: cellSize,
      backgroundColor: `rgba(59, 130, 246, ${opacity})`,
      margin: 1,
      borderRadius: 2,
    };
  };

  const getPlaceholderTextStyles = (): TextStyle => ({
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  });

  const renderHeatmapGrid = () => {
    if (isLoading) {
      return (
        <View style={getHeatmapContainerStyles()}>
          <Text style={getPlaceholderTextStyles()}>Loading heatmap...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={getHeatmapContainerStyles()}>
          <Text style={[getPlaceholderTextStyles(), { color: "#EF4444" }]}>
            Error: {error}
          </Text>
        </View>
      );
    }

    // Generate mock grid cells with random intensities
    const cells = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const intensity = Math.random();
      cells.push(<View key={i} style={getCellStyles(intensity)} />);
    }

    return (
      <View style={getHeatmapContainerStyles()}>
        <View style={getGridStyles()}>{cells}</View>
      </View>
    );
  };

  const renderLegend = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ fontSize: 12, color: "#6B7280" }}>Low</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
          marginHorizontal: 8,
        }}
      >
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 8,
              backgroundColor: `rgba(59, 130, 246, ${opacity})`,
              marginHorizontal: 1,
            }}
          />
        ))}
      </View>
      <Text style={{ fontSize: 12, color: "#6B7280" }}>High</Text>
    </View>
  );

  return (
    <Card style={style} onPress={onPress} variant="elevated">
      <Text style={getTitleStyles()}>{title}</Text>
      {renderHeatmapGrid()}
      {!isLoading && !error && renderLegend()}
      <Text
        style={[getPlaceholderTextStyles(), { fontSize: 10, marginTop: 4 }]}
      >
        // TODO manual implementation
      </Text>
    </Card>
  );
};

export {};
