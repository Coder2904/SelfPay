import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormInput } from "../../components/forms/FormInput";
import { FormButton } from "../../components/forms/FormButton";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Button } from "../../components/ui/Button";
import type { AuthStackScreenProps } from "../../types/navigation";

type ForgotPasswordScreenProps = AuthStackScreenProps<"ForgotPassword">;

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setEmail(value);
    if (error) {
      setError("");
    }
  };

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual password reset logic
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setEmailSent(true);
      Alert.alert(
        "Reset Email Sent",
        "If an account with this email exists, you will receive password reset instructions shortly.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate("Login");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <LoadingSpinner message="Sending reset email..." overlay />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View
            style={{ alignItems: "center", marginBottom: 48, marginTop: 40 }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Reset Password
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#6B7280",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Enter your email address and we'll send you instructions to reset
              your password
            </Text>
          </View>

          {/* Reset Form */}
          <View style={{ marginBottom: 32 }}>
            <FormInput
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={handleInputChange}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              validation={{
                required: true,
                pattern: /\S+@\S+\.\S+/,
              }}
            />

            <FormButton
              type="submit"
              title="Send Reset Email"
              onSubmit={handleResetPassword}
              validateForm={validateForm}
              size="large"
              style={{ marginTop: 8 }}
            />
          </View>

          {/* Instructions */}
          <View
            style={{
              backgroundColor: "#F3F4F6",
              padding: 16,
              borderRadius: 8,
              marginBottom: 32,
            }}
          >
            <Text style={{ fontSize: 14, color: "#374151", lineHeight: 20 }}>
              <Text style={{ fontWeight: "600" }}>Note:</Text> If you don't
              receive an email within a few minutes, please check your spam
              folder or try again with a different email address.
            </Text>
          </View>

          {/* Footer Link */}
          <View style={{ alignItems: "center", marginTop: "auto" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#6B7280", fontSize: 16 }}>
                Remember your password?{" "}
              </Text>
              <Button
                title="Sign In"
                variant="ghost"
                onPress={navigateToLogin}
                style={{ paddingHorizontal: 0 }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
