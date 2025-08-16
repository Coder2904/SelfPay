/**
 * SubscriptionStatusIndicator - Components for displaying subscription status
 * Shows current subscription tier and provides upgrade prompts
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSubscriptionStatus } from "../../hooks/useSubscription";
import { SubscriptionTier } from "../../types/subscription";

interface SubscriptionStatusIndicatorProps {
  variant?: "badge" | "card" | "banner" | "compact";
  showUpgradeButton?: boolean;
  onUpgradePress?: () => void;
  source?: string;
}

/**
 * Main subscription status indicator component
 */
export const SubscriptionStatusIndicator: React.FC<
  SubscriptionStatusIndicatorProps
> = ({
  variant = "badge",
  showUpgradeButton = true,
  onUpgradePress,
  source = "status_indicator",
}) => {
  const navigation = useNavigation();
  const { status, isLoading, isTrialActive } = useSubscriptionStatus();

  const handleUpgradePress = () => {
    if (onUpgradePress) {
      onUpgradePress();
    } else {
      (navigation as any).navigate("Paywall", { source });
    }
  };

  if (isLoading) {
    return <LoadingIndicator variant={variant} />;
  }

  switch (variant) {
    case "badge":
      return (
        <SubscriptionBadge
          status={status}
          isTrialActive={isTrialActive}
          showUpgradeButton={showUpgradeButton}
          onUpgradePress={handleUpgradePress}
        />
      );
    case "card":
      return (
        <SubscriptionCard
          status={status}
          isTrialActive={isTrialActive}
          showUpgradeButton={showUpgradeButton}
          onUpgradePress={handleUpgradePress}
        />
      );
    case "banner":
      return (
        <SubscriptionBanner
          status={status}
          isTrialActive={isTrialActive}
          showUpgradeButton={showUpgradeButton}
          onUpgradePress={handleUpgradePress}
        />
      );
    case "compact":
      return (
        <CompactStatusIndicator
          status={status}
          isTrialActive={isTrialActive}
          showUpgradeButton={showUpgradeButton}
          onUpgradePress={handleUpgradePress}
        />
      );
    default:
      return null;
  }
};

/**
 * Badge variant - small status indicator
 */
const SubscriptionBadge: React.FC<{
  status: any;
  isTrialActive: boolean;
  showUpgradeButton: boolean;
  onUpgradePress: () => void;
}> = ({ status, isTrialActive, showUpgradeButton, onUpgradePress }) => {
  const { color, text, icon } = getStatusDisplay(status.tier, isTrialActive);

  return (
    <View style={styles.badgeContainer}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeIcon}>{icon}</Text>
        <Text style={styles.badgeText}>{text}</Text>
      </View>
      {showUpgradeButton && status.tier !== "pro" && (
        <TouchableOpacity
          style={styles.badgeUpgradeButton}
          onPress={onUpgradePress}
          activeOpacity={0.8}
        >
          <Text style={styles.badgeUpgradeText}>↗</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Card variant - detailed status card
 */
const SubscriptionCard: React.FC<{
  status: any;
  isTrialActive: boolean;
  showUpgradeButton: boolean;
  onUpgradePress: () => void;
}> = ({ status, isTrialActive, showUpgradeButton, onUpgradePress }) => {
  const { color, text, icon, description } = getStatusDisplay(
    status.tier,
    isTrialActive
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardIcon}>{icon}</Text>
          <View>
            <Text style={styles.cardTitle}>{text}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
        </View>
        <View style={[styles.cardStatusBadge, { backgroundColor: color }]}>
          <Text style={styles.cardStatusText}>{status.tier.toUpperCase()}</Text>
        </View>
      </View>

      {/* Features list */}
      <View style={styles.cardFeatures}>
        <Text style={styles.cardFeaturesTitle}>Active Features:</Text>
        {status.features.slice(0, 3).map((feature: string, index: number) => (
          <Text key={index} style={styles.cardFeature}>
            • {formatFeatureName(feature)}
          </Text>
        ))}
        {status.features.length > 3 && (
          <Text style={styles.cardFeature}>
            • +{status.features.length - 3} more features
          </Text>
        )}
      </View>

      {/* Expiration info */}
      {status.expiresAt && (
        <Text style={styles.cardExpiration}>
          {isTrialActive ? "Trial ends" : "Expires"}:{" "}
          {formatDate(status.expiresAt)}
        </Text>
      )}

      {/* Upgrade button */}
      {showUpgradeButton && status.tier !== "pro" && (
        <TouchableOpacity
          style={styles.cardUpgradeButton}
          onPress={onUpgradePress}
          activeOpacity={0.8}
        >
          <Text style={styles.cardUpgradeText}>
            {status.tier === "free" ? "Upgrade to Premium" : "Upgrade to Pro"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Banner variant - top banner notification
 */
const SubscriptionBanner: React.FC<{
  status: any;
  isTrialActive: boolean;
  showUpgradeButton: boolean;
  onUpgradePress: () => void;
}> = ({ status, isTrialActive, showUpgradeButton, onUpgradePress }) => {
  // Only show banner for free users or trial expiring soon
  const shouldShowBanner =
    status.tier === "free" ||
    (isTrialActive &&
      status.trialEndsAt &&
      isExpiringWithinDays(status.trialEndsAt, 3));

  if (!shouldShowBanner) {
    return null;
  }

  const message = isTrialActive
    ? `Your trial expires in ${getDaysUntilExpiration(status.trialEndsAt)} days`
    : "Upgrade to unlock premium features";

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>{message}</Text>
      {showUpgradeButton && (
        <TouchableOpacity
          style={styles.bannerButton}
          onPress={onUpgradePress}
          activeOpacity={0.8}
        >
          <Text style={styles.bannerButtonText}>Upgrade</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Compact variant - minimal status display
 */
const CompactStatusIndicator: React.FC<{
  status: any;
  isTrialActive: boolean;
  showUpgradeButton: boolean;
  onUpgradePress: () => void;
}> = ({ status, isTrialActive, showUpgradeButton, onUpgradePress }) => {
  const { color, icon } = getStatusDisplay(status.tier, isTrialActive);

  return (
    <View style={styles.compactContainer}>
      <View style={[styles.compactIndicator, { backgroundColor: color }]}>
        <Text style={styles.compactIcon}>{icon}</Text>
      </View>
      {showUpgradeButton && status.tier !== "pro" && (
        <TouchableOpacity
          style={styles.compactUpgradeButton}
          onPress={onUpgradePress}
          activeOpacity={0.8}
        >
          <Text style={styles.compactUpgradeText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Loading indicator for different variants
 */
const LoadingIndicator: React.FC<{ variant: string }> = ({ variant }) => {
  switch (variant) {
    case "badge":
      return (
        <View style={[styles.badge, styles.loadingBadge]}>
          <Text style={styles.badgeText}>Loading...</Text>
        </View>
      );
    case "card":
      return (
        <View style={[styles.card, styles.loadingCard]}>
          <Text style={styles.loadingText}>Loading subscription status...</Text>
        </View>
      );
    default:
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
  }
};

/**
 * Utility functions
 */
const getStatusDisplay = (tier: SubscriptionTier, isTrialActive: boolean) => {
  if (isTrialActive) {
    return {
      color: "#FF9500",
      text: "Trial Active",
      icon: "⏰",
      description: "Enjoying premium features",
    };
  }

  switch (tier) {
    case "pro":
      return {
        color: "#8B5CF6",
        text: "Pro",
        icon: "💎",
        description: "All features unlocked",
      };
    case "premium":
      return {
        color: "#3B82F6",
        text: "Premium",
        icon: "⭐",
        description: "Advanced features active",
      };
    default:
      return {
        color: "#6B7280",
        text: "Free",
        icon: "🆓",
        description: "Basic features only",
      };
  }
};

const formatFeatureName = (feature: string): string => {
  return feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDaysUntilExpiration = (expirationDate: string): number => {
  const now = new Date();
  const expiration = new Date(expirationDate);
  const diffTime = expiration.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isExpiringWithinDays = (
  expirationDate: string,
  days: number
): boolean => {
  return getDaysUntilExpiration(expirationDate) <= days;
};

const styles = StyleSheet.create({
  // Badge styles
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  badgeUpgradeButton: {
    marginLeft: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeUpgradeText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },

  // Card styles
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  cardStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardStatusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  cardFeatures: {
    marginBottom: 12,
  },
  cardFeaturesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  cardFeature: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  cardExpiration: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
  },
  cardUpgradeButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cardUpgradeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  // Banner styles
  banner: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerText: {
    color: "white",
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  bannerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bannerButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  // Compact styles
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  compactIcon: {
    fontSize: 12,
  },
  compactUpgradeButton: {
    marginLeft: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  compactUpgradeText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },

  // Loading styles
  loadingBadge: {
    backgroundColor: "#f0f0f0",
  },
  loadingCard: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
  },
  loadingContainer: {
    padding: 8,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
});

// Export statement for TypeScript module resolution
export default SubscriptionStatusIndicator;
