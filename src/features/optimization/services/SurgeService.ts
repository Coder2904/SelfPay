/**
 * SurgeService - Handles surge pricing data and optimization recommendations
 */

import { USE_MOCK_DATA } from "../../../constants";
import type {
  OptimizationData,
  SurgeZone,
  Recommendation,
} from "../../../types";

// Mock data import - using require for JSON compatibility
const mockSurgeData =
  require("../../../../mock/surgeData.json") as OptimizationData;

export class SurgeService {
  /**
   * Get surge data and recommendations
   * Returns mock data when USE_MOCK_DATA is true, otherwise fetches from API
   */
  async getSurgeData(): Promise<OptimizationData> {
    if (USE_MOCK_DATA) {
      return this.getMockSurgeData();
    }

    // TODO manual implementation - Replace with real API call
    return this.getRealSurgeData();
  }

  /**
   * Get surge zones only
   */
  async getSurgeZones(): Promise<SurgeZone[]> {
    const data = await this.getSurgeData();
    return data.surgeZones;
  }

  /**
   * Get recommendations only
   */
  async getRecommendations(): Promise<Recommendation[]> {
    const data = await this.getSurgeData();
    return data.recommendations;
  }

  /**
   * Get recommendations filtered by type
   */
  async getRecommendationsByType(
    type: "surge" | "demand" | "bonus"
  ): Promise<Recommendation[]> {
    const recommendations = await this.getRecommendations();
    return recommendations.filter((rec) => rec.type === type);
  }

  /**
   * Get recommendations filtered by platform
   */
  async getRecommendationsByPlatform(
    platform: string
  ): Promise<Recommendation[]> {
    const recommendations = await this.getRecommendations();
    return recommendations.filter(
      (rec) => rec.platform.toLowerCase() === platform.toLowerCase()
    );
  }

  /**
   * Get high confidence recommendations (confidence > 0.8)
   */
  async getHighConfidenceRecommendations(): Promise<Recommendation[]> {
    const recommendations = await this.getRecommendations();
    return recommendations.filter((rec) => rec.confidence > 0.8);
  }

  /**
   * Private method to load mock data
   */
  private async getMockSurgeData(): Promise<OptimizationData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate mock data structure
    if (!this.validateOptimizationData(mockSurgeData)) {
      throw new Error("Invalid mock surge data structure");
    }

    return mockSurgeData;
  }

  /**
   * Private method for real API implementation
   * TODO manual implementation - Implement real API integration
   */
  private async getRealSurgeData(): Promise<OptimizationData> {
    // TODO manual implementation - Replace with actual API endpoint
    throw new Error("Real API integration not implemented yet");

    // Example implementation structure:
    // try {
    //   const response = await fetch('/api/optimization/surge-data');
    //   const data = await response.json();
    //
    //   if (!this.validateOptimizationData(data)) {
    //     throw new Error('Invalid API response structure');
    //   }
    //
    //   return data;
    // } catch (error) {
    //   console.error('Failed to fetch surge data:', error);
    //   // Fallback to mock data on error
    //   return this.getMockSurgeData();
    // }
  }

  /**
   * Validate optimization data structure
   */
  private validateOptimizationData(data: unknown): data is OptimizationData {
    if (!data || typeof data !== "object" || data === null) {
      return false;
    }

    const optimizationData = data as Record<string, any>;

    return (
      Array.isArray(optimizationData.surgeZones) &&
      Array.isArray(optimizationData.recommendations) &&
      typeof optimizationData.lastUpdated === "string" &&
      optimizationData.surgeZones.every((zone: unknown) =>
        this.validateSurgeZone(zone)
      ) &&
      optimizationData.recommendations.every((rec: unknown) =>
        this.validateRecommendation(rec)
      )
    );
  }

  /**
   * Validate surge zone structure
   */
  private validateSurgeZone(zone: unknown): zone is SurgeZone {
    if (!zone || typeof zone !== "object" || zone === null) {
      return false;
    }

    const surgeZone = zone as Record<string, any>;

    return (
      typeof surgeZone.id === "string" &&
      surgeZone.location &&
      typeof surgeZone.location === "object" &&
      typeof surgeZone.location.lat === "number" &&
      typeof surgeZone.location.lng === "number" &&
      typeof surgeZone.location.name === "string" &&
      typeof surgeZone.multiplier === "number" &&
      typeof surgeZone.platform === "string" &&
      typeof surgeZone.timestamp === "string" &&
      typeof surgeZone.duration === "number"
    );
  }

  /**
   * Validate recommendation structure
   */
  private validateRecommendation(rec: unknown): rec is Recommendation {
    if (!rec || typeof rec !== "object" || rec === null) {
      return false;
    }

    const recommendation = rec as Record<string, any>;

    return (
      typeof recommendation.id === "string" &&
      ["surge", "demand", "bonus"].includes(recommendation.type) &&
      typeof recommendation.platform === "string" &&
      typeof recommendation.title === "string" &&
      typeof recommendation.description === "string" &&
      typeof recommendation.estimatedEarnings === "number" &&
      typeof recommendation.confidence === "number" &&
      recommendation.timeWindow &&
      typeof recommendation.timeWindow === "object" &&
      typeof recommendation.timeWindow.start === "string" &&
      typeof recommendation.timeWindow.end === "string"
    );
  }
}

// Export singleton instance
export const surgeService = new SurgeService();

export {};
