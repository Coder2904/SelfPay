/**
 * Subscription Route Guards
 * Utilities for protecting routes based on subscription status
 */

import { SubscriptionTier } from "../types/subscription";

/**
 * Route protection configuration
 */
export interface RouteProtection {
  requiredTier?: SubscriptionTier;
  requiredFeature?: string;
  fallbackRoute?: string;
  showPaywall?: boolean;
  paywallConfig?: {
    title: string;
    message: string;
    source: string;
  };
}

/**
 * Protected route definitions
 */
export const PROTECTED_ROUTES: Record<string, RouteProtection> = {
  // Premium features
  AdvancedOptimization: {
    requiredTier: "premium",
    fallbackRoute: "Optimization",
    showPaywall: true,
    paywallConfig: {
      title: "Advanced Optimization",
      message:
        "Get detailed surge predictions and personalized recommendations.",
      source: "advanced_optimization",
    },
  },
  IncomeAnalytics: {
    requiredTier: "premium",
    fallbackRoute: "IncomeDashboard",
    showPaywall: true,
    paywallConfig: {
      title: "Income Analytics",
      message: "Track your earnings with detailed analytics and insights.",
      source: "income_analytics",
    },
  },
  GoalTracking: {
    requiredTier: "premium",
    fallbackRoute: "IncomeDashboard",
    showPaywall: true,
    paywallConfig: {
      title: "Goal Tracking",
      message: "Set and track your income goals with smart recommendations.",
      source: "goal_tracking",
    },
  },

  // Pro features
  MultiPlatformOptimization: {
    requiredTier: "pro",
    fallbackRoute: "Optimization",
    showPaywall: true,
    paywallConfig: {
      title: "Multi-Platform Optimization",
      message:
        "Optimize earnings across all your gig work platforms simultaneously.",
      source: "multi_platform_optimization",
    },
  },
  CustomAlerts: {
    requiredTier: "pro",
    fallbackRoute: "Dashboard",
    showPaywall: true,
    paywallConfig: {
      title: "Custom Alerts",
      message:
        "Create personalized alerts for surge pricing and earning opportunities.",
      source: "custom_alerts",
    },
  },
  AdvancedAnalytics: {
    requiredTier: "pro",
    fallbackRoute: "IncomeDashboard",
    showPaywall: true,
    paywallConfig: {
      title: "Advanced Analytics",
      message:
        "Deep dive into your earning patterns with comprehensive analytics.",
      source: "advanced_analytics",
    },
  },

  // Feature-specific protections
  PremiumRecommendations: {
    requiredFeature: "advanced_recommendations",
    fallbackRoute: "Optimization",
    showPaywall: true,
    paywallConfig: {
      title: "Premium Recommendations",
      message: "Get AI-powered recommendations to maximize your earnings.",
      source: "premium_recommendations",
    },
  },

  // Navigation-specific protections
  AccountConnection: {
    requiredTier: "premium",
    fallbackRoute: "IncomeDashboard",
    showPaywall: true,
    paywallConfig: {
      title: "Bank Account Connection",
      message: "Connect your bank accounts to track income automatically.",
      source: "account_connection",
    },
  },
  TransactionHistory: {
    requiredTier: "premium",
    fallbackRoute: "IncomeDashboard",
    showPaywall: true,
    paywallConfig: {
      title: "Transaction History",
      message: "View detailed transaction history and analytics.",
      source: "transaction_history",
    },
  },
};

/**
 * Check if a route requires subscription protection
 */
export const isProtectedRoute = (routeName: string): boolean => {
  return routeName in PROTECTED_ROUTES;
};

/**
 * Get protection configuration for a route
 */
export const getRouteProtection = (
  routeName: string
): RouteProtection | null => {
  return PROTECTED_ROUTES[routeName] || null;
};

/**
 * Subscription-based navigation decision logic
 */
export interface NavigationDecision {
  canNavigate: boolean;
  shouldShowPaywall: boolean;
  fallbackRoute?: string;
  paywallConfig?: {
    title: string;
    message: string;
    source: string;
    requiredTier?: SubscriptionTier;
    requiredFeature?: string;
  };
}

/**
 * Determine navigation decision based on subscription status
 */
export const getNavigationDecision = (
  routeName: string,
  hasFeature: (featureId: string) => boolean,
  canAccessTier: (tier: SubscriptionTier) => boolean
): NavigationDecision => {
  const protection = getRouteProtection(routeName);

  // If route is not protected, allow navigation
  if (!protection) {
    return { canNavigate: true, shouldShowPaywall: false };
  }

  // Check tier-based protection
  if (protection.requiredTier && !canAccessTier(protection.requiredTier)) {
    return {
      canNavigate: false,
      shouldShowPaywall: protection.showPaywall || false,
      fallbackRoute: protection.fallbackRoute,
      paywallConfig: protection.paywallConfig
        ? {
            ...protection.paywallConfig,
            requiredTier: protection.requiredTier,
          }
        : undefined,
    };
  }

  // Check feature-based protection
  if (protection.requiredFeature && !hasFeature(protection.requiredFeature)) {
    return {
      canNavigate: false,
      shouldShowPaywall: protection.showPaywall || false,
      fallbackRoute: protection.fallbackRoute,
      paywallConfig: protection.paywallConfig
        ? {
            ...protection.paywallConfig,
            requiredFeature: protection.requiredFeature,
          }
        : undefined,
    };
  }

  // User has access
  return { canNavigate: true, shouldShowPaywall: false };
};

/**
 * Route access levels for easy categorization
 */
export const ROUTE_ACCESS_LEVELS = {
  FREE: "free",
  PREMIUM: "premium",
  PRO: "pro",
} as const;

/**
 * Get all routes accessible at a given tier
 */
export const getAccessibleRoutes = (
  tier: SubscriptionTier,
  features: string[]
): string[] => {
  const accessibleRoutes: string[] = [];

  Object.entries(PROTECTED_ROUTES).forEach(([routeName, protection]) => {
    // Check tier access
    if (protection.requiredTier) {
      const tierHierarchy = { free: 0, premium: 1, pro: 2 };
      const currentLevel = tierHierarchy[tier];
      const requiredLevel = tierHierarchy[protection.requiredTier];

      if (currentLevel >= requiredLevel) {
        accessibleRoutes.push(routeName);
      }
    }

    // Check feature access
    if (
      protection.requiredFeature &&
      features.includes(protection.requiredFeature)
    ) {
      accessibleRoutes.push(routeName);
    }
  });

  return accessibleRoutes;
};

/**
 * Get upgrade suggestions based on attempted route access
 */
export const getUpgradeSuggestion = (
  routeName: string,
  currentTier: SubscriptionTier
): {
  suggestedTier: SubscriptionTier;
  benefits: string[];
  reason: string;
} | null => {
  const protection = getRouteProtection(routeName);

  if (!protection?.requiredTier) {
    return null;
  }

  const benefits = getBenefitsForTier(protection.requiredTier);
  const reason = `Access ${routeName
    .replace(/([A-Z])/g, " $1")
    .trim()} and other ${protection.requiredTier} features`;

  return {
    suggestedTier: protection.requiredTier,
    benefits,
    reason,
  };
};

/**
 * Get benefits for a subscription tier
 */
const getBenefitsForTier = (tier: SubscriptionTier): string[] => {
  switch (tier) {
    case "premium":
      return [
        "Unlimited surge tracking",
        "Advanced recommendations",
        "Income analytics",
        "Goal tracking",
      ];
    case "pro":
      return [
        "All Premium features",
        "Multi-platform optimization",
        "Custom alerts",
        "Priority support",
        "Advanced analytics",
      ];
    default:
      return [];
  }
};

export {};
