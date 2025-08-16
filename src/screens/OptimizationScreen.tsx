/**
 * OptimizationScreen - Main screen for surge pricing and earning recommendations
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import type { AppTabScreenProps } from "../types/navigation";
import type { SurgeZone, Recommendation } from "../types";
import {
  SurgeHeatmap,
  RecommendationList,
  EarningsOpportunityCard,
} from "../features/optimization";
import { surgeService } from "../features/optimization/services/SurgeService";

type OptimizationScreenProps = AppTabScreenProps<"Optimization">;

interface OptimizationScreenState {
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  topRecommendations: Recommendation[];
}

export const OptimizationScreen: React.FC<OptimizationScreenProps> = ({
  navigation,
}) => {
  const [state, setState] = useState<OptimizationScreenState>({
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    topRecommendations: [],
  });

  // Load initial data
  useEffect(() => {
    loadOptimizationData();
  }, []);

  // Set up real-time data updates
  useEffect(() => {
    // TODO manual implementation - Add real-time data updates with WebSocket or polling
    const updateInterval = setInterval(() => {
      if (!state.isLoading && !state.isRefreshing) {
        loadOptimizationData(true); // Silent refresh
      }
    }, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(updateInterval);
  }, [state.isLoading, state.isRefreshing]);

  const loadOptimizationData = async (silent = false) => {
    try {
      if (!silent) {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
      }

      // Load top recommendations for the summary section
      const recommendations =
        await surgeService.getHighConfidenceRecommendations();
      const topRecommendations = recommendations.slice(0, 3); // Show top 3

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        topRecommendations,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load optimization data";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleRefresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isRefreshing: true }));
    await loadOptimizationData();
    setState((prev) => ({ ...prev, isRefreshing: false }));
  }, []);

  const handleSurgeZonePress = (zone: SurgeZone) => {
    // TODO manual implementation - Add navigation to detailed zone view
    Alert.alert(
      `${zone.location.name} - ${zone.platform}`,
      `Surge multiplier: ${zone.multiplier}x\nEstimated duration: ${Math.round(
        zone.duration / 60
      )} minutes\n\nWould you like to navigate to this area?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Get Directions",
          onPress: () => {
            // TODO manual implementation - Integrate with maps for navigation
            Alert.alert("Navigation", "Maps integration coming soon!");
          },
        },
      ]
    );
  };

  const handleRecommendationPress = (recommendation: Recommendation) => {
    // TODO manual implementation - Add navigation to detailed recommendation view
    Alert.alert(
      recommendation.title,
      `${
        recommendation.description
      }\n\nEstimated earnings: $${recommendation.estimatedEarnings.toFixed(
        2
      )}\nConfidence: ${Math.round(
        recommendation.confidence * 100
      )}%\n\nWould you like to take action on this opportunity?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "View Details",
          onPress: () => {
            // TODO manual implementation - Navigate to detailed recommendation screen
            Alert.alert("Details", "Detailed view coming soon!");
          },
        },
      ]
    );
  };

  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return "Never";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  const renderHeader = () => (
    <View className="bg-white px-4 py-6 border-b border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-2xl font-bold text-gray-900">
            Smart Optimization
          </Text>
          <Text className="text-gray-600 mt-1">
            Maximize your earnings with real-time insights
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleRefresh()}
          className="bg-blue-50 px-3 py-2 rounded-lg"
        >
          <Text className="text-blue-600 font-medium text-sm">Refresh</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center mt-4">
        <Text className="text-sm text-gray-500">
          Last updated: {formatLastUpdated(state.lastUpdated)}
        </Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          <Text className="text-sm text-green-600 font-medium">Live Data</Text>
        </View>
      </View>
    </View>
  );

  const renderTopRecommendations = () => (
    <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm border border-gray-200">
      <View className="p-4 border-b border-gray-100">
        <Text className="text-lg font-semibold text-gray-900">
          Top Opportunities
        </Text>
        <Text className="text-gray-600 text-sm mt-1">
          High-confidence recommendations for you
        </Text>
      </View>

      {state.topRecommendations.length > 0 ? (
        <View className="p-4">
          {state.topRecommendations.map((recommendation, index) => (
            <View
              key={recommendation.id}
              className={
                index < state.topRecommendations.length - 1 ? "mb-3" : ""
              }
            >
              <EarningsOpportunityCard
                recommendation={recommendation}
                onPress={() => handleRecommendationPress(recommendation)}
                showFullDetails={false}
              />
            </View>
          ))}
          <TouchableOpacity
            className="mt-4 py-3 bg-blue-50 rounded-lg"
            onPress={() => {
              // TODO manual implementation - Scroll to recommendations section
              Alert.alert("View All", "Scroll down to see all recommendations");
            }}
          >
            <Text className="text-blue-600 font-medium text-center">
              View All Recommendations
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="p-4">
          <Text className="text-gray-500 text-center">
            No high-confidence opportunities available right now
          </Text>
          <Text className="text-gray-400 text-center text-sm mt-1">
            Check back later for new recommendations
          </Text>
        </View>
      )}
    </View>
  );

  const renderSurgeSection = () => (
    <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm border border-gray-200">
      <View className="p-4 border-b border-gray-100">
        <Text className="text-lg font-semibold text-gray-900">Surge Zones</Text>
        <Text className="text-gray-600 text-sm mt-1">
          Real-time surge pricing across platforms
        </Text>
      </View>
      <View className="h-80">
        <SurgeHeatmap
          onZonePress={handleSurgeZonePress}
          refreshing={state.isRefreshing}
          onRefresh={handleRefresh}
        />
      </View>
    </View>
  );

  const renderRecommendationsSection = () => (
    <View className="bg-white mx-4 mt-4 mb-4 rounded-lg shadow-sm border border-gray-200">
      <View className="p-4 border-b border-gray-100">
        <Text className="text-lg font-semibold text-gray-900">
          All Recommendations
        </Text>
        <Text className="text-gray-600 text-sm mt-1">
          Complete list of earning opportunities
        </Text>
      </View>
      <View className="h-96">
        <RecommendationList
          onRecommendationPress={handleRecommendationPress}
          refreshing={state.isRefreshing}
          onRefresh={handleRefresh}
        />
      </View>
    </View>
  );

  const renderLoadingState = () => (
    <SafeAreaView className="flex-1 bg-gray-50">
      {renderHeader()}
      <View className="flex-1 justify-center items-center">
        <View className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <Text className="text-gray-600 text-lg">
          Loading optimization data...
        </Text>
        <Text className="text-gray-500 text-sm mt-2">
          Fetching real-time surge and recommendation data
        </Text>
      </View>
    </SafeAreaView>
  );

  const renderErrorState = () => (
    <SafeAreaView className="flex-1 bg-gray-50">
      {renderHeader()}
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-6xl mb-4">⚠️</Text>
        <Text className="text-red-600 text-lg font-semibold text-center mb-2">
          Unable to Load Data
        </Text>
        <Text className="text-gray-600 text-center mb-6 leading-6">
          {state.error}
        </Text>
        <TouchableOpacity
          onPress={() => loadOptimizationData()}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            // TODO manual implementation - Add offline mode or cached data
            Alert.alert(
              "Offline Mode",
              "Offline mode with cached data will be available in future updates"
            );
          }}
          className="mt-4"
        >
          <Text className="text-blue-600">Use Cached Data</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Show loading state on initial load
  if (state.isLoading && !state.lastUpdated) {
    return renderLoadingState();
  }

  // Show error state if there's an error and no cached data
  if (state.error && !state.lastUpdated) {
    return renderErrorState();
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={state.isRefreshing}
            onRefresh={handleRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderTopRecommendations()}
        {renderSurgeSection()}
        {renderRecommendationsSection()}

        {/* TODO manual implementation - Add more sections */}
        <View className="bg-white mx-4 mt-4 mb-6 rounded-lg shadow-sm border border-gray-200 p-4">
          <Text className="text-gray-600 text-center text-sm">
            🚀 More optimization features coming soon!
          </Text>
          <Text className="text-gray-500 text-center text-xs mt-2">
            Advanced analytics, route optimization, and earnings predictions
          </Text>
        </View>
      </ScrollView>

      {/* Error banner for non-critical errors */}
      {state.error && state.lastUpdated && (
        <View className="bg-yellow-50 border-t border-yellow-200 px-4 py-3">
          <Text className="text-yellow-800 text-sm text-center">
            ⚠️ Some data may be outdated. Tap refresh to try again.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default OptimizationScreen;
