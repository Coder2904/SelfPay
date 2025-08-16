/**
 * RecommendationList - Component for showing earning opportunities
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import type { Recommendation } from "../../../types";
import { surgeService } from "../services/SurgeService";
import { EarningsOpportunityCard } from "../index";

interface RecommendationListProps {
  filterType?: "surge" | "demand" | "bonus" | "all";
  filterPlatform?: string;
  onRecommendationPress?: (recommendation: Recommendation) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  maxItems?: number;
}

interface RecommendationListState {
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
  filterType = "all",
  filterPlatform,
  onRecommendationPress,
  refreshing = false,
  onRefresh,
  maxItems,
}) => {
  const [state, setState] = useState<RecommendationListState>({
    recommendations: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadRecommendations();
  }, [filterType, filterPlatform]);

  const loadRecommendations = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      let recommendations: Recommendation[];

      // TODO manual implementation - Add more sophisticated filtering logic
      if (filterType === "all") {
        recommendations = await surgeService.getRecommendations();
      } else {
        recommendations = await surgeService.getRecommendationsByType(
          filterType
        );
      }

      // Filter by platform if specified
      if (filterPlatform) {
        recommendations = recommendations.filter(
          (rec) => rec.platform.toLowerCase() === filterPlatform.toLowerCase()
        );
      }

      // Sort by confidence and estimated earnings
      // TODO manual implementation - Add more sophisticated sorting algorithms
      recommendations.sort((a, b) => {
        // Primary sort: confidence (descending)
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        // Secondary sort: estimated earnings (descending)
        return b.estimatedEarnings - a.estimatedEarnings;
      });

      // Limit results if maxItems is specified
      if (maxItems && maxItems > 0) {
        recommendations = recommendations.slice(0, maxItems);
      }

      setState((prev) => ({ ...prev, recommendations, isLoading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load recommendations";
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      loadRecommendations();
    }
  };

  const handleRecommendationPress = (recommendation: Recommendation) => {
    if (onRecommendationPress) {
      onRecommendationPress(recommendation);
    }
    // TODO manual implementation - Add default action like navigation to details
  };

  const getFilterTitle = (): string => {
    if (filterPlatform) {
      return `${filterPlatform} Recommendations`;
    }

    switch (filterType) {
      case "surge":
        return "Surge Opportunities";
      case "demand":
        return "High Demand Areas";
      case "bonus":
        return "Bonus Opportunities";
      default:
        return "All Recommendations";
    }
  };

  const getEmptyStateMessage = (): string => {
    if (filterType === "all" && !filterPlatform) {
      return "No recommendations available right now";
    }

    let message = "No ";
    if (filterType !== "all") {
      message += filterType + " ";
    }
    message += "recommendations";
    if (filterPlatform) {
      message += ` for ${filterPlatform}`;
    }
    message += " available";

    return message;
  };

  if (state.isLoading) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <View className="w-8 h-8 border-2 border-blue-500 rounded-full mb-2" />
        <Text className="text-gray-600 text-center">
          Loading recommendations...
        </Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">{state.error}</Text>
        <TouchableOpacity onPress={loadRecommendations}>
          <Text className="text-blue-500 text-center">Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state.recommendations.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-gray-500 text-center text-lg mb-2">
          {getEmptyStateMessage()}
        </Text>
        <Text className="text-gray-400 text-center">
          Check back later for new opportunities
        </Text>
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
          {getFilterTitle()} ({state.recommendations.length})
        </Text>

        <View>
          {state.recommendations.map((recommendation) => (
            <View key={recommendation.id} className="mb-3">
              <EarningsOpportunityCard
                recommendation={recommendation}
                onPress={() => handleRecommendationPress(recommendation)}
              />
            </View>
          ))}
        </View>

        {/* TODO manual implementation - Add pagination for large lists */}
        {state.recommendations.length >= 10 && (
          <View className="mt-4 p-4 bg-gray-50 rounded-lg">
            <Text className="text-gray-600 text-center">
              Showing top {state.recommendations.length} recommendations
            </Text>
            <Text className="text-gray-500 text-center text-sm mt-1">
              Pagination will be added in future updates
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default RecommendationList;
