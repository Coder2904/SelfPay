/**
 * FeatureGate - Higher-Order Component for feature access control
 * Restricts access to premium features based on subscription status
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  useSubscriptionStatus,
  useFeatureAccess,
  useTierAccess,
} from "../../hooks/useSubscription";
import { SubscriptionTier } from "../../types/subscription";
import { UpgradePrompt } from "./UpgradePrompt";

interface FeatureGateProps {
  children: React.ReactNode;
  featureId?: string;
  requiredTier?: SubscriptionTier;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  upgradePromptTitle?: string;
  upgradePromptMessage?: string;
  upgradePromptSource?: string;
}

/**
 * FeatureGate component that conditionally renders children based on subscription access
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  featureId,
  requiredTier,
  fallback,
  showUpgradePrompt = true,
  upgradePromptTitle,
  upgradePromptMessage,
  upgradePromptSource = "feature_gate",
}) => {
  const { isLoading } = useSubscriptionStatus();
  const featureAccess = useFeatureAccess(featureId || "");
  const tierAccess = useTierAccess(requiredTier || "free");

  // Show loading state while checking subscription
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Checking access...</Text>
      </View>
    );
  }

  // Determine if user has access
  let hasAccess = true;

  if (featureId) {
    hasAccess = featureAccess.hasAccess;
  } else if (requiredTier) {
    hasAccess = tierAccess.hasAccess;
  }

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show upgrade prompt if enabled
  if (showUpgradePrompt) {
    const defaultTitle = requiredTier
      ? `${
          requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)
        } Feature`
      : "Premium Feature";

    const defaultMessage = requiredTier
      ? `This feature requires a ${requiredTier} subscription.`
      : featureId
      ? "This feature is not available in your current plan."
      : "Upgrade to access this feature.";

    return (
      <UpgradePrompt
        title={upgradePromptTitle || defaultTitle}
        message={upgradePromptMessage || defaultMessage}
        requiredTier={requiredTier}
        source={upgradePromptSource}
      />
    );
  }

  // Default fallback - empty view
  return <View style={styles.hiddenContainer} />;
};

/**
 * Higher-Order Component version of FeatureGate
 */
export const withFeatureGate = <P extends object>(
  Component: React.ComponentType<P>,
  gateConfig: Omit<FeatureGateProps, "children">
) => {
  const WrappedComponent = (props: P) => (
    <FeatureGate {...gateConfig}>
      <Component {...props} />
    </FeatureGate>
  );

  WrappedComponent.displayName = `withFeatureGate(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

/**
 * Hook version for conditional rendering in components
 */
export const useFeatureGate = (
  featureId?: string,
  requiredTier?: SubscriptionTier
) => {
  const featureAccess = useFeatureAccess(featureId || "");
  const tierAccess = useTierAccess(requiredTier || "free");

  let hasAccess = true;
  if (featureId) {
    hasAccess = featureAccess.hasAccess;
  } else if (requiredTier) {
    hasAccess = tierAccess.hasAccess;
  }

  return {
    hasAccess,
    canRender: hasAccess,
    shouldShowUpgrade: !hasAccess,
  };
};

/**
 * Utility component for inline feature gating
 */
interface ConditionalFeatureProps {
  featureId?: string;
  requiredTier?: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConditionalFeature: React.FC<ConditionalFeatureProps> = ({
  featureId,
  requiredTier,
  children,
  fallback = null,
}) => {
  const { hasAccess } = useFeatureGate(featureId, requiredTier);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  hiddenContainer: {
    display: "none",
  },
});

// Ensure module exports
export default FeatureGate;
