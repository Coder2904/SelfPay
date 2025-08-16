/**
 * SubscriptionGuard - Navigation guard component for subscription-based route protection
 * Wraps screens to enforce subscription requirements
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useSubscriptionStatus } from "../../hooks/useSubscription";
import {
  getNavigationDecision,
  getRouteProtection,
  NavigationDecision,
} from "../../navigation/subscriptionRouteGuards";
import { UpgradePrompt } from "../subscription/UpgradePrompt";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  routeName?: string;
  fallbackComponent?: React.ReactNode;
  onAccessDenied?: (decision: NavigationDecision) => void;
}

/**
 * SubscriptionGuard component that protects routes based on subscription status
 */
export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  routeName,
  fallbackComponent,
  onAccessDenied,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isLoading, hasFeature, canAccessFeature } = useSubscriptionStatus();

  // Use provided routeName or get from route
  const currentRouteName = routeName || route.name;

  // Check access when component mounts or subscription status changes
  useFocusEffect(
    React.useCallback(() => {
      if (isLoading) return;

      const decision = getNavigationDecision(
        currentRouteName,
        hasFeature,
        canAccessFeature
      );

      if (!decision.canNavigate) {
        if (onAccessDenied) {
          onAccessDenied(decision);
        }

        // Navigate to fallback route if specified
        if (decision.fallbackRoute) {
          (navigation as any).navigate(decision.fallbackRoute);
          return;
        }

        // Show paywall if configured
        if (decision.shouldShowPaywall && decision.paywallConfig) {
          (navigation as any).navigate("Paywall", {
            ...decision.paywallConfig,
            source: decision.paywallConfig.source,
          });
          return;
        }
      }
    }, [
      currentRouteName,
      isLoading,
      hasFeature,
      canAccessFeature,
      navigation,
      onAccessDenied,
    ])
  );

  // Show loading while checking subscription
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  // Get navigation decision
  const decision = getNavigationDecision(
    currentRouteName,
    hasFeature,
    canAccessFeature
  );

  // If user has access, render children
  if (decision.canNavigate) {
    return <>{children}</>;
  }

  // If fallback component is provided, use it
  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // Show upgrade prompt as default fallback
  if (decision.paywallConfig) {
    return (
      <View style={styles.container}>
        <UpgradePrompt
          title={decision.paywallConfig.title}
          message={decision.paywallConfig.message}
          requiredTier={decision.paywallConfig.requiredTier}
          source={decision.paywallConfig.source}
          showCloseButton={true}
          onClose={() => {
            if (decision.fallbackRoute) {
              (navigation as any).navigate(decision.fallbackRoute);
            } else {
              navigation.goBack();
            }
          }}
        />
      </View>
    );
  }

  // Default: empty view (shouldn't reach here)
  return <View style={styles.emptyContainer} />;
};

/**
 * Higher-Order Component version of SubscriptionGuard
 */
export const withSubscriptionGuard = <P extends object>(
  Component: React.ComponentType<P>,
  guardConfig?: Omit<SubscriptionGuardProps, "children">
) => {
  const GuardedComponent = (props: P) => (
    <SubscriptionGuard {...guardConfig}>
      <Component {...props} />
    </SubscriptionGuard>
  );

  GuardedComponent.displayName = `withSubscriptionGuard(${
    Component.displayName || Component.name
  })`;

  return GuardedComponent;
};

/**
 * Screen-level guard for protecting entire screens
 */
interface ProtectedScreenProps {
  children: React.ReactNode;
  routeName: string;
  loadingComponent?: React.ReactNode;
  accessDeniedComponent?: React.ReactNode;
}

export const ProtectedScreen: React.FC<ProtectedScreenProps> = ({
  children,
  routeName,
  loadingComponent,
  accessDeniedComponent,
}) => {
  const { isLoading, hasFeature, canAccessFeature } = useSubscriptionStatus();

  // Show loading component while checking subscription
  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  // Check if route is protected
  const protection = getRouteProtection(routeName);
  if (!protection) {
    return <>{children}</>;
  }

  // Check access
  let hasAccess = true;
  if (protection.requiredTier) {
    hasAccess = canAccessFeature(protection.requiredTier);
  } else if (protection.requiredFeature) {
    hasAccess = hasFeature(protection.requiredFeature);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show access denied component
  if (accessDeniedComponent) {
    return <>{accessDeniedComponent}</>;
  }

  // Default access denied UI
  return (
    <View style={styles.container}>
      <UpgradePrompt
        title={protection.paywallConfig?.title || "Premium Feature"}
        message={
          protection.paywallConfig?.message ||
          "This feature requires a subscription."
        }
        requiredTier={protection.requiredTier}
        source={protection.paywallConfig?.source || "protected_screen"}
        showCloseButton={true}
      />
    </View>
  );
};

/**
 * Hook for checking route access in components
 */
export const useRouteAccess = (routeName?: string) => {
  const route = useRoute();
  const { hasFeature, canAccessFeature, isLoading } = useSubscriptionStatus();

  const currentRouteName = routeName || route.name;

  const decision = React.useMemo(() => {
    if (isLoading) return null;

    return getNavigationDecision(
      currentRouteName,
      hasFeature,
      canAccessFeature
    );
  }, [currentRouteName, hasFeature, canAccessFeature, isLoading]);

  return {
    hasAccess: decision?.canNavigate ?? false,
    isLoading,
    decision,
    protection: getRouteProtection(currentRouteName),
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "white",
  },
});

export {};
