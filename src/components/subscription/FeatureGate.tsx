/**
 * FeatureGate - Higher-Order Component for restricting access to premium features
 * Wraps components and shows upgrade prompts when users don't have required subscription tier
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { LoadingIndicator } from "../ui/LoadingIndicator";
import { useSubscriptionStatus } from "../../hooks/useSubscription";
import type { SubscriptionTier } from "../../types/subscription";

interface FeatureGateProps {
  requiredTier: SubscriptionTier;
  requiredFeature?: string;
  fallbackComponent?: React.ComponentType<any>;
  upgradePrompt?: {
    title?: string;
    description?: string;
    ctaText?: string;
  };
  onUpgradePress?: () => void;
  children: React.ReactNode;
}

/**
 * FeatureGate component that conditionally renders content based on subscription status
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  requiredTier,
  requiredFeature,
  fallbackComponent: FallbackComponent,
  upgradePrompt,
  onUpgradePress,
  children,
}) => {
  const { isLoading, canAccessFeature, hasFeature, tier, isActive } =
    useSubscriptionStatus();

  // Show loading state while checking subscription
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator message="Checking subscription status..." />
      </View>
    );
  }

  // Check feature access based on tier
  const hasRequiredTier = canAccessFeature(requiredTier);

  // Check specific feature if provided
  const hasRequiredFeature = requiredFeature
    ? hasFeature(requiredFeature)
    : true;

  // Allow access if user has required tier and feature
  if (hasRequiredTier && hasRequiredFeature) {
    return <>{children}</>;
  }

  // Show custom fallback component if provided
  if (FallbackComponent) {
    return <FallbackComponent />;
  }

  // Show default upgrade prompt
  return (
    <UpgradePrompt
      currentTier={tier}
      requiredTier={requiredTier}
      requiredFeature={requiredFeature}
      isActive={isActive}
      customPrompt={upgradePrompt}
      onUpgradePress={onUpgradePress}
    />
  );
};

/**
 * Higher-Order Component version of FeatureGate
 */
export const withFeatureGate = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  gateConfig: Omit<FeatureGateProps, "children">
) => {
  const FeatureGatedComponent = (props: P) => {
    return (
      <FeatureGate {...gateConfig}>
        <WrappedComponent {...props} />
      </FeatureGate>
    );
  };

  // Set display name for debugging
  FeatureGatedComponent.displayName = `withFeatureGate(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return FeatureGatedComponent;
};

/**
 * Default upgrade prompt component
 */
interface UpgradePromptProps {
  currentTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  requiredFeature?: string;
  isActive: boolean;
  customPrompt?: {
    title?: string;
    description?: string;
    ctaText?: string;
  };
  onUpgradePress?: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  currentTier,
  requiredTier,
  requiredFeature,
  isActive,
  customPrompt,
  onUpgradePress,
}) => {
  const getDefaultPrompt = () => {
    const tierNames = {
      free: "Free",
      premium: "Premium",
      pro: "Pro",
    };

    const featureName = requiredFeature
      ? requiredFeature
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
      : "this feature";

    return {
      title: `${tierNames[requiredTier]} Feature`,
      description: `${featureName} requires a ${tierNames[requiredTier]} subscription. Upgrade now to unlock this feature and many more!`,
      ctaText: `Upgrade to ${tierNames[requiredTier]}`,
    };
  };

  const prompt = customPrompt || getDefaultPrompt();

  const handleUpgradePress = () => {
    if (onUpgradePress) {
      onUpgradePress();
    } else {
      // TODO: Navigate to paywall screen
      console.log("Navigate to paywall for tier:", requiredTier);
    }
  };

  return (
    <View style={styles.container}>
      <Card variant="outlined" style={styles.promptCard}>
        <View style={styles.iconContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>

        <Text style={styles.title}>{prompt.title}</Text>
        <Text style={styles.description}>{prompt.description}</Text>

        <View style={styles.currentStatusContainer}>
          <Text style={styles.currentStatusLabel}>Current Plan:</Text>
          <Text style={styles.currentStatusValue}>
            {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
            {!isActive && currentTier !== "free" && " (Expired)"}
          </Text>
        </View>

        <Button
          title={prompt.ctaText}
          variant="primary"
          onPress={handleUpgradePress}
          style={styles.upgradeButton}
        />

        <Text style={styles.learnMoreText}>
          Learn more about our subscription plans and features
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  promptCard: {
    width: "100%",
    maxWidth: 400,
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  currentStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    width: "100%",
    justifyContent: "center",
  },
  currentStatusLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8,
  },
  currentStatusValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  upgradeButton: {
    width: "100%",
    marginBottom: 16,
  },
  learnMoreText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

export {};
