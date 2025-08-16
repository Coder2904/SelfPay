/**
 * Restore Flow Component
 * Handles subscription restoration with user feedback
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Button } from "../ui/Button";
import { LoadingIndicator } from "../ui/LoadingIndicator";
import { useSubscriptionStore } from "../../stores/subscriptionStore";

interface RestoreFlowProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (restoredCount: number) => void;
  onError: (error: string) => void;
}

export const RestoreFlow: React.FC<RestoreFlowProps> = ({
  visible,
  onClose,
  onSuccess,
  onError,
}) => {
  const [step, setStep] = useState<
    "confirm" | "processing" | "success" | "error" | "no_purchases"
  >("confirm");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [restoredCount, setRestoredCount] = useState<number>(0);

  const { restore, clearError } = useSubscriptionStore();

  const handleRestore = async () => {
    try {
      setStep("processing");
      clearError();

      const purchases = await restore();

      if (purchases.length === 0) {
        setStep("no_purchases");
      } else {
        setRestoredCount(purchases.length);
        setStep("success");
        onSuccess(purchases.length);
      }
    } catch (error) {
      console.error("Restore failed:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to restore purchases. Please try again.";
      setErrorMessage(errorMsg);
      setStep("error");
      onError(errorMsg);
    }
  };

  const handleClose = () => {
    setStep("confirm");
    setErrorMessage("");
    setRestoredCount(0);
    onClose();
  };

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>🔄</Text>
      </View>

      <Text style={styles.stepTitle}>Restore Purchases</Text>
      <Text style={styles.stepDescription}>
        This will restore any previous purchases made with your Apple ID or
        Google account. Your subscription status will be updated automatically.
      </Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>What gets restored:</Text>
        <Text style={styles.infoItem}>• Active subscriptions</Text>
        <Text style={styles.infoItem}>• Previous purchases</Text>
        <Text style={styles.infoItem}>• Premium features access</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={handleClose}
          style={styles.button}
        />
        <Button
          title="Restore"
          variant="primary"
          onPress={handleRestore}
          style={styles.button}
        />
      </View>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={styles.stepContainer}>
      <LoadingIndicator message="Restoring your purchases..." />
      <Text style={styles.processingText}>
        This may take a few moments. Please don't close this screen.
      </Text>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✓</Text>
      </View>

      <Text style={styles.successTitle}>Restore Successful!</Text>
      <Text style={styles.successMessage}>
        {restoredCount === 1
          ? "1 purchase has been restored."
          : `${restoredCount} purchases have been restored.`}
      </Text>
      <Text style={styles.successSubtext}>
        Your subscription status has been updated and you now have access to
        your premium features.
      </Text>

      <Button
        title="Continue"
        variant="primary"
        onPress={handleClose}
        style={styles.fullWidthButton}
      />
    </View>
  );

  const renderNoPurchasesStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.infoIcon}>
        <Text style={styles.infoIconText}>ℹ</Text>
      </View>

      <Text style={styles.infoTitle}>No Purchases Found</Text>
      <Text style={styles.infoMessage}>
        We couldn't find any previous purchases associated with your account.
        This could mean:
      </Text>

      <View style={styles.reasonsContainer}>
        <Text style={styles.reasonItem}>
          • You haven't made any purchases yet
        </Text>
        <Text style={styles.reasonItem}>
          • You're signed in with a different account
        </Text>
        <Text style={styles.reasonItem}>
          • Your purchases were made on a different device
        </Text>
      </View>

      <Text style={styles.suggestionText}>
        If you believe this is an error, please contact our support team.
      </Text>

      <Button
        title="OK"
        variant="primary"
        onPress={handleClose}
        style={styles.fullWidthButton}
      />
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.errorIcon}>
        <Text style={styles.errorIconText}>✕</Text>
      </View>

      <Text style={styles.errorTitle}>Restore Failed</Text>
      <Text style={styles.errorMessage}>{errorMessage}</Text>

      <View style={styles.troubleshootContainer}>
        <Text style={styles.troubleshootTitle}>Try these steps:</Text>
        <Text style={styles.troubleshootItem}>
          • Check your internet connection
        </Text>
        <Text style={styles.troubleshootItem}>
          • Make sure you're signed in to the correct account
        </Text>
        <Text style={styles.troubleshootItem}>
          • Restart the app and try again
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
      case "no_purchases":
        return renderNoPurchasesStep();
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  iconText: {
    fontSize: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  infoContainer: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    marginBottom: 32,
    width: "100%",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0C4A6E",
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    color: "#0369A1",
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
  },
  fullWidthButton: {
    width: "100%",
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
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  infoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  infoIconText: {
    fontSize: 40,
    color: "#3B82F6",
  },
  infoMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  reasonsContainer: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
  },
  reasonItem: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  troubleshootContainer: {
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 32,
    width: "100%",
  },
  troubleshootTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 8,
  },
  troubleshootItem: {
    fontSize: 14,
    color: "#DC2626",
    marginBottom: 4,
  },
});

export {};
