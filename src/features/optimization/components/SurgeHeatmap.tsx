/**
 * SurgeHeatmap - Component for displaying surge pricing zones
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import type { SurgeZone } from "../../../types";
import { surgeService } from "../services/SurgeService";

interface SurgeHeatmapProps {
  onZonePress?: (zone: SurgeZone) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

interface SurgeHeatmapState {
  zones: SurgeZone[];
  isLoading: boolean;
  error: string | null;
}

export const SurgeHeatmap: React.FC<SurgeHeatmapProps> = ({
  onZonePress,
  refreshing = false,
  onRefresh,
}) => {
  const [state, setState] = useState<SurgeHeatmapState>({
    zones: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadSurgeZones();
  }, []);

  const loadSurgeZones = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const zones = await surgeService.getSurgeZones();
      setState((prev) => ({ ...prev, zones, isLoading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load surge zones";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      loadSurgeZones();
    }
  };

  const handleZonePress = (zone: SurgeZone) => {
    if (onZonePress) {
      onZonePress(zone);
    } else {
      // Default behavior - show zone details
      Alert.alert(
        `${zone.location.name}`,
        `Platform: ${zone.platform}\nSurge: ${
          zone.multiplier
        }x\nDuration: ${Math.round(zone.duration / 60)} minutes`,
        [{ text: "OK" }]
      );
    }
  };

  const getSurgeColor = (multiplier: number): string => {
    // TODO manual implementation - Replace with more sophisticated color mapping
    if (multiplier >= 3.0) return "bg-red-500";
    if (multiplier >= 2.0) return "bg-orange-500";
    if (multiplier >= 1.5) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (state.isLoading) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <View className="w-8 h-8 border-2 border-blue-500 rounded-full mb-2" />
        <Text className="text-gray-600 text-center">
          Loading surge zones...
        </Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">{state.error}</Text>
        <TouchableOpacity onPress={loadSurgeZones}>
          <Text className="text-blue-500 text-center">Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#3B82F6"]}
          tintColor="#3B82F6"
        />
      }
    >
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Surge Zones ({state.zones.length})
        </Text>

        {/* TODO manual implementation - Replace with actual map integration */}
        <View className="bg-gray-100 rounded-lg p-4 mb-4">
          <Text className="text-gray-600 text-center">
            🗺️ Interactive Map Coming Soon
          </Text>
        </View>

        {/* Zone List */}
        <View>
          {state.zones.map((zone) => (
            <TouchableOpacity
              key={zone.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-3"
              onPress={() => handleZonePress(zone)}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {zone.location.name}
                  </Text>
                  <Text className="text-gray-600 capitalize">
                    {zone.platform}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${getSurgeColor(
                    zone.multiplier
                  )}`}
                >
                  <Text className="text-white font-bold">
                    {zone.multiplier}x
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default SurgeHeatmap;
