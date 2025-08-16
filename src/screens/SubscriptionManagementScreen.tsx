/**
 * Subscription Management Screen
 * Allows users to view and manage their active subscriptions
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
} from "react-native";
import { useSubscriptionStore } from "../stores/subscriptionStore";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LoadingIndicator } from "../components/ui/LoadingIndicator";
import { EmptyState } from "../components/ui/EmptyState";
import type {
  SubscriptionStatus,
  SubscriptionPlan,
} from "../types/subscription";

const SubscriptionManagementScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const {
    status,
    availablePlans,
    isLoading,
    error,
    initialize,
    checkStatus,
    restore,
    clearError,
  } = useSubscriptionStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await checkStatus();
    } catch (error) {
      console.error("Failed to refresh subscription status:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoreLoading(true);
      clearError();

      await restore();

      Alert.alert(
        "Restore Complete",
        "Your previous purchases have been restored and your subscription status has been updated.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Restore failed:", error);
      Alert.alert(
        "Restore Failed",
        error instanceof Error
          ? error.message
          : "Unable to restore purchases. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setRestoreLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCurrentPlan = (): SubscriptionPlan | null => {
    return availablePlans.find((plan) => plan.tier === status.tier) || null;
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    if (!status.isActive) return "#6B7280";
    if (status.tier === "pro") return "#8B5CF6";
    if (status.tier === "premium") return "#3B82F6";
    return "#10B981";
  };

  const getStatusText = (status: SubscriptionStatus) => {
    if (!status.isActive) return "Free Plan";
    if (status.cancelledAt) return "Cancelled (Active until expiration)";
    if (status.trialEndsAt) {
      const trialEnd = new Date(status.trialEndsAt);
      if (trialEnd > new Date()) return "Free Trial";
    }
    return "Active Subscription";
  };

  const renderSubscriptionStatus = () => {
    const currentPlan = getCurrentPlan();
    const statusColor = getStatusColor(status);
    const statusText = getStatusText(status);

    return (
      <Card variant="elevated" style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View>
            <Text style={styles.statusTitle}>Current Plan</Text>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusBadgeText}>
              {status.tier.toUpperCase()}
            </Text>
          </View>
        </View>

        {currentPlan && (
          <View style={styles.planDetails}>
            <Text style={styles.planName}>{currentPlan.name}</Text>
            <Text style={styles.planDescription}>
              {currentPlan.description}
            </Text>

            {currentPlan.price > 0 && (
              <Text style={styles.planPrice}>
                ${currentPlan.price.toFixed(2)}/
                {currentPlan.interval === "yearly" ? "year" : "month"}
              </Text>
            )}
          </View>
        )}

        <View style={styles.statusDetails}>
          {status.isActive && status.expiresAt && (
            <View style={styles.statusDetailItem}>
              <Text style={styles.statusDetailLabel}>
                {status.cancelledAt ? "Active Until" : "Renews On"}
              </Text>
              <Text style={styles.statusDetailValue}>
                {formatDate(status.expiresAt)}
              </Text>
            </View>
          )}

          {status.trialEndsAt && (
            <View style={styles.statusDetailItem}>
              <Text style={styles.statusDetailLabel}>Trial Ends</Text>
              <Text style={styles.statusDetailValue}>
                {formatDate(status.trialEndsAt)}
              </Text>
            </View>
          )}

          {status.cancelledAt && (
            <View style={styles.statusDetailItem}>
              <Text style={styles.statusDetailLabel}>Cancelled On</Text>
              <Text style={styles.statusDetailValue}>
                {formatDate(status.cancelledAt)}
              </Text>
            </View>
          )}

          <View style={styles.statusDetailItem}>
            <Text style={styles.statusDetailLabel}>Auto-Renew</Text>
            <Text
              style={[
                styles.statusDetailValue,
                { color: status.autoRenew ? "#10B981" : "#EF4444" },
              ]}
            >
              {status.autoRenew ? "Enabled" : "Disabled"}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderFeatures = () => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return null;

    return (
      <Card variant="outlined" style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>Included Features</Text>
        <View style={styles.featuresContainer}>
          {currentPlan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureCheckmark}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderActions = () => {
    return (
      <Card variant="outlined" style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Manage Subscription</Text>

        <View style={styles.actionsContainer}>
          <Button
            title="Restore Purchases"
            variant="outline"
            onPress={handleRestore}
            isLoading={restoreLoading}
            style={styles.actionButton}
          />

          {!status.isActive && (
            <Button
              title="Upgrade Plan"
              variant="primary"
              onPress={() => {
                // TODO: Navigate to paywall screen
                Alert.alert(
                  "Upgrade Plan",
                  "Navigate to paywall to upgrade your subscription.",
                  [{ text: "OK" }]
                );
              }}
              style={styles.actionButton}
            />
          )}

          {status.isActive && !status.cancelledAt && (
            <Button
              title="Manage Billing"
              variant="outline"
              onPress={() => {
                Alert.alert(
                  "Manage Billing",
                  "To manage your billing and subscription settings, please visit your account settings in the App Store or Google Play Store.",
                  [{ text: "OK" }]
                );
              }}
              style={styles.actionButton}
            />
          )}

          {status.isActive && !status.cancelledAt && (
            <Button
              title="Cancel Subscription"
              variant="outline"
              onPress={() => {
                Alert.alert(
                  "Cancel Subscription",
                  "To cancel your subscription, please visit your account settings in the App Store or Google Play Store. Your subscription will remain active until the end of the current billing period.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open Settings", style: "default" },
                  ]
                );
              }}
              style={[styles.actionButton, styles.cancelButton]}
            />
          )}
        </View>
      </Card>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator message="Loading subscription details..." />
      </SafeAreaView>
    );
  }

  if (error && !status) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="Unable to Load Subscription"
          message={error}
          actionLabel="Retry"
          onAction={() => {
            clearError();
            initialize();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Subscription</Text>
          <Text style={styles.subtitle}>
            Manage your subscription and billing preferences
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Retry"
              variant="outline"
              size="small"
              onPress={() => {
                clearError();
                checkStatus();
              }}
            />
          </View>
        )}

        <View style={styles.content}>
          {renderSubscriptionStatus()}
          {renderFeatures()}
          {renderActions()}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For billing questions or technical support, please contact our
            support team.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 12,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  statusCard: {
    padding: 20,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  planDetails: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
  },
  statusDetails: {
    gap: 12,
  },
  statusDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusDetailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  featuresCard: {
    padding: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureCheckmark: {
    fontSize: 16,
    color: "#10B981",
    marginRight: 12,
    fontWeight: "bold",
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  actionsCard: {
    padding: 20,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  cancelButton: {
    borderColor: "#EF4444",
  },
  footer: {
    padding: 20,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
});

export default SubscriptionManagementScreen;
