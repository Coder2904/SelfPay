/**
 * Paywall Screen
 * Displays subscription plans and handles purchase flow
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useSubscriptionStore } from "../stores/subscriptionStore";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LoadingIndicator } from "../components/ui/LoadingIndicator";
// Purchase and restore flows will be implemented inline
import type { RootStackScreenProps } from "../types/navigation";
import type { SubscriptionPlan } from "../types/subscription";

type PaywallScreenProps = RootStackScreenProps<"Paywall">;

const PaywallScreen: React.FC<PaywallScreenProps> = ({ route, navigation }) => {
  const { source, feature } = route.params;
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
  const [showRestoreFlow, setShowRestoreFlow] = useState(false);

  const {
    availablePlans,
    isLoading,
    error,
    initialize,
    purchase,
    restore,
    clearError,
  } = useSubscriptionStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handlePurchase = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPurchaseFlow(true);
  };

  const handlePurchaseSuccess = () => {
    Alert.alert(
      "Purchase Successful!",
      "Your subscription has been activated. You now have access to premium features.",
      [
        {
          text: "Continue",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handlePurchaseError = (error: string) => {
    Alert.alert("Purchase Failed", error, [{ text: "OK" }]);
  };

  const handleRestoreSuccess = (restoredCount: number) => {
    Alert.alert(
      "Restore Complete",
      `${restoredCount} purchase${
        restoredCount === 1 ? "" : "s"
      } restored. Your subscription status has been updated.`,
      [
        {
          text: "Continue",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleRestoreError = (error: string) => {
    Alert.alert("Restore Failed", error, [{ text: "OK" }]);
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    if (price === 0) return "Free";
    return `$${price.toFixed(2)}/${interval === "yearly" ? "year" : "month"}`;
  };

  const getAnnualSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    const savings = monthlyCost - yearlyPrice;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { savings, percentage };
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan?.id === plan.id;

    // Calculate savings for yearly plans
    let savingsInfo = null;
    if (plan.interval === "yearly") {
      const monthlyPlan = availablePlans.find(
        (p) => p.tier === plan.tier && p.interval === "monthly"
      );
      if (monthlyPlan) {
        savingsInfo = getAnnualSavings(monthlyPlan.price, plan.price);
      }
    }

    return (
      <Card
        key={plan.id}
        variant="outlined"
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          plan.isPopular && styles.popularPlanCard,
        ]}
        onPress={() => setSelectedPlan(plan)}
      >
        {plan.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>Most Popular</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planPrice}>
            {formatPrice(plan.price, plan.currency, plan.interval)}
          </Text>
          {savingsInfo && (
            <Text style={styles.savingsText}>
              Save ${savingsInfo.savings.toFixed(0)} ({savingsInfo.percentage}%)
            </Text>
          )}
        </View>

        <Text style={styles.planDescription}>{plan.description}</Text>

        {plan.trialDays && plan.trialDays > 0 && (
          <View style={styles.trialBadge}>
            <Text style={styles.trialText}>
              {plan.trialDays}-day free trial
            </Text>
          </View>
        )}

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureCheckmark}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <Button
          title={
            plan.price === 0
              ? "Current Plan"
              : plan.trialDays
              ? `Start ${plan.trialDays}-Day Trial`
              : "Subscribe"
          }
          variant={isSelected ? "primary" : "outline"}
          isDisabled={plan.price === 0}
          onPress={() => handlePurchase(plan)}
          style={styles.subscribeButton}
        />
      </Card>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator message="Loading subscription plans..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Unlock powerful features to maximize your gig work earnings
          </Text>

          {feature && (
            <View style={styles.featureCallout}>
              <Text style={styles.featureCalloutText}>
                Unlock "{feature}" and more premium features
              </Text>
            </View>
          )}
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
                initialize();
              }}
            />
          </View>
        )}

        <View style={styles.plansContainer}>
          {availablePlans
            .filter((plan) => plan.tier !== "free")
            .sort((a, b) => {
              // Sort by tier (premium first, then pro) and then by interval (monthly first)
              if (a.tier !== b.tier) {
                return a.tier === "premium" ? -1 : 1;
              }
              return a.interval === "monthly" ? -1 : 1;
            })
            .map(renderPlanCard)}
        </View>

        <View style={styles.footer}>
          <Button
            title="Restore Purchases"
            variant="ghost"
            size="small"
            onPress={() => setShowRestoreFlow(true)}
            style={styles.restoreButton}
          />

          <Text style={styles.footerText}>
            Subscriptions auto-renew unless cancelled. You can manage your
            subscription in your account settings.
          </Text>

          <Text style={styles.sourceText}>Accessed from: {source}</Text>
        </View>
      </ScrollView>

      {/* TODO: Implement PurchaseFlow component */}
      {selectedPlan && showPurchaseFlow && (
        <View style={{ padding: 20 }}>
          <Text>
            Purchase flow for {selectedPlan.name} will be implemented here
          </Text>
        </View>
      )}

      {/* TODO: Implement RestoreFlow component */}
      {showRestoreFlow && (
        <View style={{ padding: 20 }}>
          <Text>Restore flow will be implemented here</Text>
        </View>
      )}
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
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  featureCallout: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  featureCalloutText: {
    fontSize: 14,
    color: "#1D4ED8",
    textAlign: "center",
    fontWeight: "500",
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
  plansContainer: {
    padding: 20,
    gap: 16,
  },
  planCard: {
    position: "relative",
    padding: 20,
  },
  selectedPlanCard: {
    borderColor: "#3B82F6",
    borderWidth: 2,
  },
  popularPlanCard: {
    borderColor: "#10B981",
    borderWidth: 2,
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    left: 20,
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  planHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3B82F6",
    marginBottom: 4,
  },
  savingsText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  planDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  trialBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "center",
    marginBottom: 16,
  },
  trialText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
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
  subscribeButton: {
    marginTop: 8,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  restoreButton: {
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

export default PaywallScreen;
