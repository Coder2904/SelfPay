/**
 * Navigation Guards
 * Hooks and utilities for protecting routes based on authentication and subscription status
 */

import { useEffect, useState } from "react";
import { USE_MOCK_DATA } from "../constants";

// TODO: Import actual stores when they're implemented
// For now, using mock implementations

interface AuthGuardResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

interface OnboardingGuardResult {
  isOnboardingComplete: boolean;
  isLoading: boolean;
  currentStep: number;
}

interface SubscriptionGuardResult {
  isSubscribed: boolean;
  tier: "free" | "premium" | "pro";
  hasFeatureAccess: (feature: string) => boolean;
  isLoading: boolean;
}

/**
 * Hook to check authentication status
 */
export const useAuthGuard = (): AuthGuardResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (USE_MOCK_DATA) {
          // Mock authentication check
          // TODO: Replace with actual auth store logic
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading
          setIsAuthenticated(false); // Start with unauthenticated for demo
          setUser(null);
        } else {
          // TODO: Implement real authentication check with Supabase
          // const { data: { user } } = await supabase.auth.getUser();
          // setIsAuthenticated(!!user);
          // setUser(user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
  };
};

/**
 * Hook to check onboarding completion status
 */
export const useOnboardingGuard = (): OnboardingGuardResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        if (USE_MOCK_DATA) {
          // Mock onboarding check
          // TODO: Replace with actual onboarding store logic
          await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading
          setIsOnboardingComplete(false); // Start with incomplete for demo
          setCurrentStep(0);
        } else {
          // TODO: Implement real onboarding check
          // Check AsyncStorage or user preferences
        }
      } catch (error) {
        console.error("Onboarding check failed:", error);
        setIsOnboardingComplete(false);
        setCurrentStep(0);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  return {
    isOnboardingComplete,
    isLoading,
    currentStep,
  };
};

/**
 * Hook to check subscription status and feature access
 */
export const useSubscriptionGuard = (): SubscriptionGuardResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [tier, setTier] = useState<"free" | "premium" | "pro">("free");

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        if (USE_MOCK_DATA) {
          // Mock subscription check
          // TODO: Replace with actual subscription store logic
          await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate loading
          setIsSubscribed(false); // Start with free tier for demo
          setTier("free");
        } else {
          // TODO: Implement real subscription check with RevenueCat
          // const customerInfo = await Purchases.getCustomerInfo();
          // setIsSubscribed(customerInfo.activeSubscriptions.length > 0);
        }
      } catch (error) {
        console.error("Subscription check failed:", error);
        setIsSubscribed(false);
        setTier("free");
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, []);

  const hasFeatureAccess = (feature: string): boolean => {
    // Define feature access based on subscription tier
    const featureMap: Record<string, string[]> = {
      free: ["basic_optimization", "basic_income_tracking"],
      premium: [
        "basic_optimization",
        "basic_income_tracking",
        "advanced_optimization",
        "detailed_analytics",
        "goal_tracking",
      ],
      pro: [
        "basic_optimization",
        "basic_income_tracking",
        "advanced_optimization",
        "detailed_analytics",
        "goal_tracking",
        "ai_recommendations",
        "priority_support",
        "custom_reports",
      ],
    };

    return featureMap[tier]?.includes(feature) || false;
  };

  return {
    isSubscribed,
    tier,
    hasFeatureAccess,
    isLoading,
  };
};

/**
 * Enhanced subscription guard that integrates with the subscription store
 */
export const useSubscriptionStoreGuard = () => {
  // This will be implemented to use the actual subscription store
  // For now, falling back to the mock implementation above
  return useSubscriptionGuard();
};

/**
 * Higher-order component for protecting routes based on subscription status
 * Note: This should be moved to a .tsx file when implementing actual components
 */
export const withSubscriptionGuard = <P extends object>(
  _WrappedComponent: any, // React.ComponentType<P>,
  requiredFeature: string,
  _fallbackComponent?: any // React.ComponentType<P>
) => {
  return (_props: P) => {
    const { hasFeatureAccess, isLoading } = useSubscriptionGuard();

    if (isLoading) {
      // TODO: Replace with proper loading component
      return null;
    }

    if (!hasFeatureAccess(requiredFeature)) {
      // TODO: Navigate to paywall or show upgrade prompt
      return null;
    }

    // TODO: Return wrapped component when implementing actual UI
    return null;
  };
};

/**
 * Utility function to check if user can access a specific route
 */
export const canAccessRoute = (
  routeName: string,
  authStatus: AuthGuardResult,
  subscriptionStatus: SubscriptionGuardResult
): boolean => {
  // Define route access rules
  const publicRoutes = ["Login", "Signup", "ForgotPassword"];
  const premiumRoutes = ["AdvancedOptimization", "DetailedAnalytics"];
  const proRoutes = ["AIRecommendations", "CustomReports"];

  // Public routes are always accessible
  if (publicRoutes.includes(routeName)) {
    return true;
  }

  // All other routes require authentication
  if (!authStatus.isAuthenticated) {
    return false;
  }

  // Premium routes require premium or pro subscription
  if (premiumRoutes.includes(routeName)) {
    return (
      subscriptionStatus.tier === "premium" || subscriptionStatus.tier === "pro"
    );
  }

  // Pro routes require pro subscription
  if (proRoutes.includes(routeName)) {
    return subscriptionStatus.tier === "pro";
  }

  // Default: authenticated users can access basic routes
  return true;
};

export {};
