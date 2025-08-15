import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { OnboardingProgressIndicator } from "../../components/ui/OnboardingProgressIndicator";
import { useOnboarding } from "../../hooks/useOnboarding";
import type { OnboardingStackScreenProps } from "../../types/navigation";
import type { PrivacyConsent } from "../../types/onboarding";

type PrivacyConsentScreenProps = OnboardingStackScreenProps<"PrivacyConsent">;

interface ConsentOption {
  key: keyof Omit<PrivacyConsent, "consentDate">;
  title: string;
  description: string;
  required: boolean;
  warning?: string;
}

export const PrivacyConsentScreen: React.FC<PrivacyConsentScreenProps> = ({
  navigation,
}) => {
  const {
    currentStep,
    totalSteps,
    completedSteps,
    updateResponse,
    nextStep,
    previousStep,
    isUpdatingResponse,
  } = useOnboarding();

  const [consentData, setConsentData] = useState<PrivacyConsent>({
    dataCollection: undefined as any,
    analytics: undefined as any,
    marketing: undefined as any,
    locationTracking: undefined as any,
    consentDate: new Date().toISOString(),
  });

  const consentOptions: ConsentOption[] = [
    {
      key: "dataCollection",
      title: "Data Collection",
      description:
        "Allow SelfPay to collect and store your account information, transaction data, and app usage data to provide core functionality.",
      required: true,
    },
    {
      key: "analytics",
      title: "Analytics & Performance",
      description:
        "Help us improve the app by sharing anonymous usage statistics and performance data.",
      required: false,
      warning: "Analytics help us improve the app experience",
    },
    {
      key: "locationTracking",
      title: "Location Tracking",
      description:
        "Allow location access to provide surge pricing information, nearby opportunities, and location-based recommendations.",
      required: false,
      warning:
        "Location tracking is essential for surge pricing and recommendations",
    },
    {
      key: "marketing",
      title: "Marketing Communications",
      description:
        "Receive promotional emails, feature updates, and personalized offers from SelfPay.",
      required: false,
    },
  ];

  const handleConsentToggle = (
    key: keyof Omit<PrivacyConsent, "consentDate">,
    value: boolean
  ) => {
    setConsentData((prev) => ({
      ...prev,
      [key]: value,
      consentDate: new Date().toISOString(), // Update consent date when any consent changes
    }));
  };

  const canProceed = (): boolean => {
    // Check that all required consents are explicitly set
    const requiredConsents = consentOptions.filter((option) => option.required);
    return requiredConsents.every(
      (option) => consentData[option.key] !== undefined
    );
  };

  const handleNext = async () => {
    if (!canProceed()) {
      Alert.alert(
        "Required Consent",
        "Please provide consent for all required items to continue."
      );
      return;
    }

    try {
      await updateResponse({ step: 4, response: consentData });
      nextStep();
      navigation.navigate("OnboardingComplete");
    } catch (error) {
      console.error("Failed to save privacy consent:", error);
      Alert.alert(
        "Error",
        "Failed to save your privacy preferences. Please try again."
      );
    }
  };

  const handlePrevious = () => {
    previousStep();
    navigation.goBack();
  };

  const openPrivacyPolicy = () => {
    // In a real app, this would open the actual privacy policy
    Alert.alert(
      "Privacy Policy",
      "This would open the full privacy policy in your browser.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open",
          onPress: () => {
            // Linking.openURL("https://selfpay.app/privacy");
            console.log("Would open privacy policy");
          },
        },
      ]
    );
  };

  const openTermsOfService = () => {
    // In a real app, this would open the actual terms of service
    Alert.alert(
      "Terms of Service",
      "This would open the full terms of service in your browser.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open",
          onPress: () => {
            // Linking.openURL("https://selfpay.app/terms");
            console.log("Would open terms of service");
          },
        },
      ]
    );
  };

  const renderConsentOption = (option: ConsentOption) => {
    const isConsented = consentData[option.key];
    const isSet = isConsented !== undefined;

    return (
      <Card key={option.key} variant="elevated" style={{ marginBottom: 16 }}>
        <View style={{ marginBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#111827",
                flex: 1,
              }}
            >
              {option.title}
              {option.required && <Text style={{ color: "#EF4444" }}> *</Text>}
            </Text>
            {option.required && (
              <View
                style={{
                  backgroundColor: "#FEF3C7",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#92400E",
                  }}
                >
                  REQUIRED
                </Text>
              </View>
            )}
          </View>

          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              lineHeight: 20,
              marginBottom: 16,
            }}
          >
            {option.description}
          </Text>

          {/* Warning for declined optional consents */}
          {isSet && !isConsented && option.warning && (
            <View
              style={{
                backgroundColor: "#FEF3C7",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#92400E",
                  fontWeight: "500",
                }}
              >
                ⚠️ {option.warning}
              </Text>
            </View>
          )}
        </View>

        {/* Consent Buttons */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => handleConsentToggle(option.key, true)}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: isConsented === true ? "#10B981" : "#F3F4F6",
              borderWidth: 2,
              borderColor: isConsented === true ? "#10B981" : "#E5E7EB",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "600",
                color: isConsented === true ? "#FFFFFF" : "#6B7280",
              }}
            >
              Allow
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleConsentToggle(option.key, false)}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: isConsented === false ? "#EF4444" : "#F3F4F6",
              borderWidth: 2,
              borderColor: isConsented === false ? "#EF4444" : "#E5E7EB",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "600",
                color: isConsented === false ? "#FFFFFF" : "#6B7280",
              }}
            >
              Decline
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <OnboardingProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        completedSteps={completedSteps}
        stepTitles={[
          "Personal",
          "Platforms",
          "Goals",
          "Privacy",
          "Preferences",
        ]}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Privacy & Consent
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#6B7280",
              lineHeight: 24,
            }}
          >
            We respect your privacy. Please review and choose your preferences
            for data usage.
          </Text>
        </View>

        {/* Legal Information */}
        <Card
          variant="elevated"
          style={{ marginBottom: 24, backgroundColor: "#F0F9FF" }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#1E40AF",
              marginBottom: 12,
            }}
          >
            Your Privacy Matters
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#1E40AF",
              lineHeight: 20,
              marginBottom: 16,
            }}
          >
            SelfPay is committed to protecting your privacy and being
            transparent about how we use your data. You can change these
            preferences anytime in your account settings.
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={openPrivacyPolicy}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor: "#DBEAFE",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#1E40AF",
                }}
              >
                Privacy Policy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openTermsOfService}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor: "#DBEAFE",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#1E40AF",
                }}
              >
                Terms of Service
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Consent Options */}
        {consentOptions.map(renderConsentOption)}

        {/* Consent Summary */}
        <Card variant="elevated" style={{ backgroundColor: "#F9FAFB" }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Consent Summary
          </Text>
          {consentOptions.map((option) => {
            const isConsented = consentData[option.key];
            const isSet = isConsented !== undefined;

            return (
              <View
                key={option.key}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E5E7EB",
                }}
              >
                <Text style={{ fontSize: 14, color: "#374151", flex: 1 }}>
                  {option.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: !isSet
                      ? "#9CA3AF"
                      : isConsented
                      ? "#10B981"
                      : "#EF4444",
                  }}
                >
                  {!isSet ? "Not set" : isConsented ? "Allowed" : "Declined"}
                </Text>
              </View>
            );
          })}
        </Card>
      </ScrollView>

      {/* Navigation Buttons */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        }}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Button
            title="Previous"
            variant="outline"
            size="large"
            onPress={handlePrevious}
            style={{ flex: 1 }}
          />
          <Button
            title="Complete Setup"
            variant="primary"
            size="large"
            onPress={handleNext}
            isLoading={isUpdatingResponse}
            isDisabled={!canProceed()}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PrivacyConsentScreen;
