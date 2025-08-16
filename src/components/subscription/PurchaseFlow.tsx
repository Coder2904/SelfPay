/**
 * Purchase Flow Component
 * Handles the subscription purchase process with loading states and error handling
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { LoadingIndicator } from "../ui/LoadingIndicator";
import { useSubscriptionStore } from "../../stores/subscriptionStore";
import type { SubscriptionPlan } from "../../types/subscription";

interface PurchaseFlowProps {
  plan: SubscriptionPlan;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const PurchaseFlow: React.FC<PurchaseFlowProps> = ({
  plan,
  visible,
  onClose,
  onSuccess,
  onError,
}) => {
  const [step, setStep] = useState<
    "confirm" | "processing" | "success" | "error"
  >("confirm");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { purchase, clearError } = useSubscriptionStore();

  const handlePurchase = async () => {
    try {
      setStep("processing");
      clearError();

      await purchase(plan.id);

      setStep("success");
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Purchase failed:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Purchase failed. Please try again.";
      setErrorMessage(errorMsg);
      setStep("error");
      onError(errorMsg);
    }
  };

  const handleClose = () => {
    setStep("confirm");
    setErrorMessage("");
    onClose();
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    if (price === 0) return "Free";
    return `$${price.toFixed(2)}/${interval === "yearly" ? "year" : "month"}`;
  };

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Confirm Purchase</Text>

      <Card variant="outlined" style={styles.planSummary}>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planPrice}>
          {formatPrice(plan.price, plan.currency, plan.interval)}
        </Text>
        <Text style={styles.planDescription}>{plan.description}</Text>

        {plan.trialDays && plan.trialDays > 0 && (
          <View style={styles.trialInfo}>
            <Text style={styles.trialText}>
              ✓ {plan.trialDays}-day free trial included
            </Text>
            <Text style={styles.trialSubtext}>
              You won't be charged until your trial ends
            </Text>
          </View>
        )}
      </Card>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
          Your subscription will auto-renew unless cancelled.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={handleClose}
          style={styles.button}
        />
        <Button
          title={
            plan.trialDays
              ? `Start ${plan.trialDays}-Day Trial`
              : "Subscribe Now"
          }
          variant="primary"
          onPress={handlePurchase}
          style={styles.button}
        />
      </View>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={styles.stepContainer}>
      <LoadingIndicator message="Processing your purchase..." />
      <Text style={styles.processingText}>
        Please don't close this screen while we process your subscription.
      </Text>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✓</Text>
      </View>
      <Text style={styles.successTitle}>Purchase Successful!</Text>
      <Text style={styles.successMessage}>
        Welcome to {plan.name}! You now have access to all premium features.
      </Text>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.errorIcon}>
        <Text style={styles.errorIconText}>✕</Text>
      </View>
      <Text style={styles.errorTitle}>Purchase Failed</Text>
      <Text style={styles.errorMessage}>{errorMessage}</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={handleClose}
          style={styles.button}
        />
        <Button
          title="Try Again"
          variant="primary"
          onPress={() => setStep("confirm")}
          style={styles.button}
        />
      </View>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case "confirm":
        return renderConfirmStep();
      case "processing":
        return renderProcessingStep();
      case "success":
        return renderSuccessStep();
      case "error":
        return renderErrorStep();
      default:
        return renderConfirmStep();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            disabled={step === "processing"}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>{renderStep()}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    paddingBottom: 10,
  },
  closeButton: {
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
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
    textAlign: "center",
  },
  planSummary: {
    width: "100%",
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3B82F6",
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  trialInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    width: "100%",
  },
  trialText: {
    fontSize: 14,
    color: "#15803D",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 4,
  },
  trialSubtext: {
    fontSize: 12,
    color: "#16A34A",
    textAlign: "center",
  },
  termsContainer: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
  },
  processingText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 40,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  errorIconText: {
    fontSize: 40,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
});

export {};
