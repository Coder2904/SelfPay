/**
 * UpgradePrompt - Component for encouraging subscription upgrades
 * Shows when users try to access premium features
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SubscriptionTier } from "../../types/subscription";
import { useSubscriptionStatus } from "../../hooks/useSubscription";

interface UpgradePromptProps {
  title: string;
  message: string;
  requiredTier?: SubscriptionTier;
  source: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  customAction?: {
    label: string;
    onPress: () => void;
  };
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  title,
  message,
  requiredTier,
  source,
  showCloseButton = false,
  onClose,
  customAction,
}) => {
  const navigation = useNavigation();
  const { status } = useSubscriptionStatus();

  const handleUpgradePress = () => {
    // Navigate to paywall with context
    (navigation as any).navigate("Paywall", {
      source,
      requiredTier,
      title,
      message,
    });
  };

  const handleCustomAction = () => {
    if (customAction?.onPress) {
      customAction.onPress();
    }
  };

  const getUpgradeButtonText = () => {
    if (customAction) {
      return customAction.label;
    }

    if (status.tier === "free") {
      return requiredTier === "pro" ? "Upgrade to Pro" : "Upgrade to Premium";
    }

    if (status.tier === "premium" && requiredTier === "pro") {
      return "Upgrade to Pro";
    }

    return "Upgrade Now";
  };

  const getFeatureIcon = () => {
    // Return appropriate icon based on required tier
    switch (requiredTier) {
      case "premium":
        return "⭐";
      case "pro":
        return "💎";
      default:
        return "🔒";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Feature Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getFeatureIcon()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Benefits List */}
        {requiredTier && (
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>
              {requiredTier === "pro" ? "Pro Benefits:" : "Premium Benefits:"}
            </Text>
            {getBenefitsList(requiredTier).map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>•</Text>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={customAction ? handleCustomAction : handleUpgradePress}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeButtonText}>
              {getUpgradeButtonText()}
            </Text>
          </TouchableOpacity>

          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

/**
 * Compact version of UpgradePrompt for inline use
 */
interface CompactUpgradePromptProps {
  message: string;
  requiredTier?: SubscriptionTier;
  source: string;
}

export const CompactUpgradePrompt: React.FC<CompactUpgradePromptProps> = ({
  message,
  requiredTier,
  source,
}) => {
  const navigation = useNavigation();

  const handleUpgradePress = () => {
    (navigation as any).navigate("Paywall", {
      source,
      requiredTier,
    });
  };

  return (
    <View style={styles.compactContainer}>
      <View style={styles.compactContent}>
        <Text style={styles.compactIcon}>🔒</Text>
        <Text style={styles.compactMessage}>{message}</Text>
        <TouchableOpacity
          style={styles.compactButton}
          onPress={handleUpgradePress}
          activeOpacity={0.8}
        >
          <Text style={styles.compactButtonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Banner version for top-level notifications
 */
interface UpgradeBannerProps {
  message: string;
  requiredTier?: SubscriptionTier;
  source: string;
  onDismiss?: () => void;
}

export const UpgradeBanner: React.FC<UpgradeBannerProps> = ({
  message,
  requiredTier,
  source,
  onDismiss,
}) => {
  const navigation = useNavigation();

  const handleUpgradePress = () => {
    (navigation as any).navigate("Paywall", {
      source,
      requiredTier,
    });
  };

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerMessage}>{message}</Text>
        <View style={styles.bannerButtons}>
          <TouchableOpacity
            style={styles.bannerUpgradeButton}
            onPress={handleUpgradePress}
            activeOpacity={0.8}
          >
            <Text style={styles.bannerUpgradeText}>Upgrade</Text>
          </TouchableOpacity>
          {onDismiss && (
            <TouchableOpacity
              style={styles.bannerDismissButton}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Text style={styles.bannerDismissText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// Helper function to get benefits list
const getBenefitsList = (tier: SubscriptionTier): string[] => {
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
      return ["Access to premium features"];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
    lineHeight: 22,
  },
  benefitsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  benefitBullet: {
    fontSize: 16,
    color: "#007AFF",
    marginRight: 8,
    marginTop: 2,
  },
  benefitText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
  },
  upgradeButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#666",
    fontSize: 16,
  },
  // Compact styles
  compactContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    margin: 8,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  compactMessage: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
  compactButton: {
    backgroundColor: "#007AFF",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  compactButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  // Banner styles
  bannerContainer: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerMessage: {
    flex: 1,
    color: "white",
    fontSize: 14,
    marginRight: 12,
  },
  bannerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  bannerUpgradeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  bannerUpgradeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  bannerDismissButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerDismissText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

// Export statement for TypeScript module resolution
export default UpgradePrompt;
