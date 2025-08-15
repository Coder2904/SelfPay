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
import { authService } from "../../services/AuthService";
import {
  checkBiometricAvailability,
  getBiometricTypeDisplayName,
} from "../../utils/biometricAuth";
import type { AuthStackScreenProps } from "../../types/navigation";
import type { LoginCredentials } from "../../types/auth";

type LoginScreenProps = AuthStackScreenProps<"Login">;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);

  React.useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const settings = await checkBiometricAvailability();
      setBiometricAvailable(settings.isAvailable);
      setBiometricTypes(settings.supportedTypes);
    } catch (error) {
      console.error("Failed to check biometric support:", error);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginCredentials]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await authService.login(formData);

      if (result.success) {
        // Navigation will be handled by the auth state change
        console.log("Login successful");
      } else {
        Alert.alert(
          "Login Failed",
          result.error || "Please check your credentials and try again."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    try {
      const result = await authService.authenticateWithBiometric();

      if (result.success) {
        console.log("Biometric login successful");
      } else {
        Alert.alert(
          "Authentication Failed",
          result.error || "Biometric authentication failed."
        );
      }
    } catch (error) {
      console.error("Biometric login error:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred during biometric authentication."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate("Signup");
  };

  const navigateToForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <LoadingSpinner message="Signing you in..." overlay />
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
              Welcome Back
            </Text>
            <Text
              style={{ fontSize: 16, color: "#6B7280", textAlign: "center" }}
            >
              Sign in to your SelfPay account
            </Text>
          </View>

          {/* Login Form */}
          <View style={{ marginBottom: 32 }}>
            <FormInput
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={handleInputChange}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              validation={{
                required: true,
                pattern: /\S+@\S+\.\S+/,
              }}
            />

            <FormInput
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={handleInputChange}
              error={errors.password}
              secureTextEntry
              autoComplete="password"
              validation={{
                required: true,
                minLength: 6,
              }}
            />

            <FormButton
              type="submit"
              title="Sign In"
              onSubmit={handleLogin}
              validateForm={validateForm}
              size="large"
              style={{ marginTop: 8 }}
            />
          </View>

          {/* Biometric Login */}
          {biometricAvailable && (
            <View style={{ marginBottom: 32 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }}
                />
                <Text
                  style={{
                    marginHorizontal: 16,
                    color: "#6B7280",
                    fontSize: 14,
                  }}
                >
                  or
                </Text>
                <View
                  style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }}
                />
              </View>

              <Button
                title={`Sign in with ${getBiometricTypeDisplayName(
                  biometricTypes
                )}`}
                variant="outline"
                size="large"
                onPress={handleBiometricLogin}
              />
            </View>
          )}

          {/* Footer Links */}
          <View style={{ alignItems: "center", marginTop: "auto" }}>
            <Button
              title="Forgot your password?"
              variant="ghost"
              onPress={navigateToForgotPassword}
              style={{ marginBottom: 16 }}
            />

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#6B7280", fontSize: 16 }}>
                Don't have an account?{" "}
              </Text>
              <Button
                title="Sign Up"
                variant="ghost"
                onPress={navigateToSignup}
                style={{ paddingHorizontal: 0 }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
