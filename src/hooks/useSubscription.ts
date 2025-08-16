/**
 * useSubscription - Custom hooks for subscription management
 * Provides convenient access to subscription state and actions
 */

import { useCallback, useEffect } from "react";
import { useSubscriptionStore } from "../stores/subscriptionStore";
import { SubscriptionTier } from "../types/subscription";

/**
 * Hook for accessing subscription status and related functionality
 */
export const useSubscriptionStatus = () => {
  const {
    status,
    isLoading,
    error,
    lastChecked,
    checkStatus,
    hasFeature,
    canAccessFeature,
    clearError,
  } = useSubscriptionStore();

  // Auto-refresh subscription status if it's stale (older than 5 minutes)
  useEffect(() => {
    const shouldRefresh = () => {
      if (!lastChecked) return true;

      const lastCheckedTime = new Date(lastChecked).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      return now - lastCheckedTime > fiveMinutes;
    };

    if (shouldRefresh() && !isLoading) {
      checkStatus();
    }
  }, [lastChecked, isLoading, checkStatus]);

  const refresh = useCallback(async () => {
    await checkStatus();
  }, [checkStatus]);

  return {
    // Status information
    status,
    isLoading,
    error,
    lastChecked,

    // Computed properties
    isActive: status.isActive,
    tier: status.tier,
    features: status.features,
    expiresAt: status.expiresAt,
    isTrialActive: status.trialEndsAt
      ? new Date(status.trialEndsAt) > new Date()
      : false,

    // Helper functions
    hasFeature,
    canAccessFeature,

    // Actions
    refresh,
    clearError,
  };
};

/**
 * Hook for subscription purchase functionality
 */
export const useSubscriptionPurchase = () => {
  const { availablePlans, isLoading, error, purchase, restore, clearError } =
    useSubscriptionStore();

  const purchaseProduct = useCallback(
    async (productId: string) => {
      try {
        await purchase(productId);
        return true;
      } catch (error) {
        console.error("Purchase failed:", error);
        return false;
      }
    },
    [purchase]
  );

  const restorePurchases = useCallback(async () => {
    try {
      const purchases = await restore();
      return purchases;
    } catch (error) {
      console.error("Restore failed:", error);
      return [];
    }
  }, [restore]);

  return {
    // Available plans
    availablePlans,

    // Loading and error states
    isLoading,
    error,

    // Actions
    purchaseProduct,
    restorePurchases,
    clearError,
  };
};

/**
 * Hook for checking if user can access a specific feature
 */
export const useFeatureAccess = (featureId: string) => {
  const { hasFeature } = useSubscriptionStore();

  return {
    hasAccess: hasFeature(featureId),
    featureId,
  };
};

/**
 * Hook for checking if user can access features of a specific tier
 */
export const useTierAccess = (requiredTier: SubscriptionTier) => {
  const { canAccessFeature, status } = useSubscriptionStore();

  return {
    hasAccess: canAccessFeature(requiredTier),
    currentTier: status.tier,
    requiredTier,
  };
};

/**
 * Hook for subscription initialization (use in app root)
 */
export const useSubscriptionInitialization = () => {
  const { initialize, isLoading, error } = useSubscriptionStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    isInitializing: isLoading,
    initializationError: error,
  };
};

export {};
