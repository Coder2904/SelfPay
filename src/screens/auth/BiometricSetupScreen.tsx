import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { authService } from "../../services/AuthService";
import {
  checkBiometricAvailability,
  getBiometricTypeDisplayName,
  deviceSupportsBiometrics,
} from "../../utils/biometricAuth";
import type { AuthStackScreenProps } from "../../types/navigation";
import type { BiometricSettings } from "../../types/auth";

type BiometricSetupScreenProps = AuthStackScreenProps<"BiometricSetup">;

export const BiometricSetupScreen: React.FC<BiometricSetupScreenProps> = ({
  navigation,
}) => {
  const [biometricSettings, setBiometricSettings] =
    useState<BiometricSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    checkBiometricCapabilities();
  }, []);

  const checkBiometricCapabilities = async () => {
    try {
      const settings = await checkBiometricAvailability();
      setBiometricSettings(settings);
    } catch (error) {
      console.error("Failed to check biometric capabilities:", error);
      setBiometricSettings({
        isEnabled: false,
        isAvailable: false,
        supportedTypes: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupBiometric = async () => {
    if (!biometricSettings?.isAvailable) {
      Alert.alert(
        "Not Available",
        "Biometric authentication is not available on this device or no biometric data is enrolled."
      );
      return;
    }

    setIsSettingUp(true);
    try {
      const result = await authService.setupBiometric();

      if (result.success) {
        Alert.alert(
          "Setup Complete",
          "Biometric authentication has been enabled successfully!",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Setup Failed",
          result.error ||
            "Failed to setup biometric authentication. Please try again."
        );
      }
    } catch (error) {
      console.error("Biometric setup error:", error);
      Alert.alert("Error", "An unexpected error occurred during setup.");
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Biometric Setup",
      "You can enable biometric authentication later in your account settings.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Skip",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const getBiometricIcon = (types: string[]) => {
    if (types.includes("face")) {
      return "👤"; // Face ID icon placeholder
    } else if (types.includes("fingerprint")) {
      return "👆"; // Touch ID icon placeholder
    } else if (types.includes("iris")) {
      return "👁️"; // Iris icon placeholder
    }
    return "🔒"; // Generic biometric icon
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <LoadingSpinner message="Checking biometric capabilities..." overlay />
      </SafeAreaView>
    );
  }

  if (isSettingUp) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <LoadingSpinner
          message="Setting up biometric authentication..."
          overlay
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 48, marginTop: 40 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 32 }}>
              {biometricSettings
                ? getBiometricIcon(biometricSettings.supportedTypes)
                : "🔒"}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#111827",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Enable{" "}
            {biometricSettings
              ? getBiometricTypeDisplayName(biometricSettings.supportedTypes)
              : "Biometric Authentication"}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            Secure your account with biometric authentication for quick and safe
            access
          </Text>
        </View>

        {/* Content */}
        <View style={{ flex: 1, justifyContent: "center" }}>
          {biometricSettings?.isAvailable ? (
            <>
              {/* Benefits List */}
              <View style={{ marginBottom: 40 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{ fontSize: 20, marginRight: 12, color: "#10B981" }}
                  >
                    ✓
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      Quick Access
                    </Text>
                    <Text
                      style={{ fontSize: 14, color: "#6B7280", lineHeight: 20 }}
                    >
                      Sign in instantly without typing your password
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{ fontSize: 20, marginRight: 12, color: "#10B981" }}
                  >
                    ✓
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      Enhanced Security
                    </Text>
                    <Text
                      style={{ fontSize: 14, color: "#6B7280", lineHeight: 20 }}
                    >
                      Your biometric data stays secure on your device
                    </Text>
                  </View>
                </View>

                <View
                  style={{ flexDirection: "row", alignItems: "flex-start" }}
                >
                  <Text
                    style={{ fontSize: 20, marginRight: 12, color: "#10B981" }}
                  >
                    ✓
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      Convenient
                    </Text>
                    <Text
                      style={{ fontSize: 14, color: "#6B7280", lineHeight: 20 }}
                    >
                      No need to remember or type complex passwords
                    </Text>
                  </View>
                </View>
              </View>

              {/* Setup Button */}
              <Button
                title={`Enable ${getBiometricTypeDisplayName(
                  biometricSettings.supportedTypes
                )}`}
                variant="primary"
                size="large"
                onPress={handleSetupBiometric}
                style={{ marginBottom: 16 }}
              />
            </>
          ) : (
            <>
              {/* Not Available Message */}
              <View style={{ alignItems: "center", marginBottom: 40 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#EF4444",
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  Biometric Authentication Not Available
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                    textAlign: "center",
                    lineHeight: 20,
                    marginBottom: 16,
                  }}
                >
                  Biometric authentication is not available on this device. This
                  could be because:
                </Text>

                <View style={{ alignSelf: "stretch" }}>
                  <Text
                    style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}
                  >
                    • No biometric hardware is available
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}
                  >
                    • No biometric data is enrolled on this device
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}
                  >
                    • Biometric authentication is disabled in system settings
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                    textAlign: "center",
                    lineHeight: 20,
                    marginTop: 16,
                  }}
                >
                  You can still use your email and password to sign in securely.
                </Text>
              </View>
            </>
          )}

          {/* Skip Button */}
          <Button
            title="Skip for Now"
            variant="outline"
            size="large"
            onPress={handleSkip}
          />

          {/* Footer Note */}
          <Text
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              textAlign: "center",
              marginTop: 24,
              lineHeight: 16,
            }}
          >
            You can enable or disable biometric authentication anytime in your
            account settings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BiometricSetupScreen;
