/**
 * EarningsOpportunityCard - Component with recommendation details
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { Recommendation } from "../../../types";

interface EarningsOpportunityCardProps {
  recommendation: Recommendation;
  onPress?: () => void;
  showFullDetails?: boolean;
}

export const EarningsOpportunityCard: React.FC<
  EarningsOpportunityCardProps
> = ({ recommendation, onPress, showFullDetails = true }) => {
  const getTypeColor = (type: string): string => {
    // TODO manual implementation - Add more sophisticated color theming
    switch (type) {
      case "surge":
        return "bg-red-100 text-red-800";
      case "demand":
        return "bg-blue-100 text-blue-800";
      case "bonus":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string): string => {
    // TODO manual implementation - Replace with proper icon components
    switch (type) {
      case "surge":
        return "⚡";
      case "demand":
        return "📈";
      case "bonus":
        return "🎯";
      default:
        return "💰";
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    // TODO manual implementation - Add more nuanced confidence indicators
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (confidence: number): string => {
    // TODO manual implementation - Add more descriptive confidence levels
    if (confidence >= 0.9) return "Very High";
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    if (confidence >= 0.4) return "Low";
    return "Very Low";
  };

  const formatTimeWindow = (timeWindow: {
    start: string;
    end: string;
  }): string => {
    // TODO manual implementation - Add proper timezone handling and relative time formatting
    try {
      const start = new Date(timeWindow.start);
      const end = new Date(timeWindow.end);
      const now = new Date();

      // Check if opportunity is still active
      if (now > end) {
        return "Expired";
      }

      if (now < start) {
        const hoursUntilStart = Math.round(
          (start.getTime() - now.getTime()) / (1000 * 60 * 60)
        );
        return `Starts in ${hoursUntilStart}h`;
      }

      const hoursRemaining = Math.round(
        (end.getTime() - now.getTime()) / (1000 * 60 * 60)
      );
      if (hoursRemaining < 1) {
        const minutesRemaining = Math.round(
          (end.getTime() - now.getTime()) / (1000 * 60)
        );
        return `${minutesRemaining}m left`;
      }

      return `${hoursRemaining}h left`;
    } catch (error) {
      return "Time unavailable";
    }
  };

  const formatEarnings = (earnings: number): string => {
    // TODO manual implementation - Add currency formatting based on user preferences
    return `$${earnings.toFixed(2)}`;
  };

  const isExpired = (): boolean => {
    try {
      const end = new Date(recommendation.timeWindow.end);
      return new Date() > end;
    } catch {
      return false;
    }
  };

  const CardContent = () => (
    <View
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${
        isExpired() ? "opacity-60" : ""
      }`}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg mr-2">
              {getTypeIcon(recommendation.type)}
            </Text>
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              {recommendation.title}
            </Text>
          </View>
          <Text className="text-gray-600 capitalize text-sm">
            {recommendation.platform}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-xl font-bold text-green-600">
            {formatEarnings(recommendation.estimatedEarnings)}
          </Text>
          <Text className="text-xs text-gray-500">estimated</Text>
        </View>
      </View>

      {/* Type Badge */}
      <View className="flex-row items-center mb-3">
        <View
          className={`px-2 py-1 rounded-full ${getTypeColor(
            recommendation.type
          )} mr-2`}
        >
          <Text className="text-xs font-medium capitalize">
            {recommendation.type}
          </Text>
        </View>

        {recommendation.location && (
          <View className="px-2 py-1 rounded-full bg-gray-100">
            <Text className="text-xs text-gray-700">
              📍 {recommendation.location}
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      {showFullDetails && (
        <Text className="text-gray-700 mb-3 leading-5">
          {recommendation.description}
        </Text>
      )}

      {/* Footer */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-500 mr-3">Confidence:</Text>
          <Text
            className={`text-sm font-medium ${getConfidenceColor(
              recommendation.confidence
            )}`}
          >
            {getConfidenceLabel(recommendation.confidence)} (
            {Math.round(recommendation.confidence * 100)}%)
          </Text>
        </View>

        <Text
          className={`text-sm font-medium ${
            isExpired() ? "text-red-500" : "text-blue-600"
          }`}
        >
          {formatTimeWindow(recommendation.timeWindow)}
        </Text>
      </View>

      {/* TODO manual implementation - Add action buttons */}
      {showFullDetails && !isExpired() && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <Text className="text-xs text-gray-500 text-center">
            Tap for more details • Navigation coming soon
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

export default EarningsOpportunityCard;
