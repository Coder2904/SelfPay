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
import type { AuthStackScreenProps } from "../../types/navigation";
import type { SignupCredentials } from "../../types/auth";

type SignupScreenProps = AuthStackScreenProps<"Signup">;

interface SignupFormData extends SignupCredentials {
  confirmPassword: string;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof SignupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupFormData> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // First name validation
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last name validation
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Phone number validation (optional but if provided, must be valid)
    if (
      formData.phoneNumber &&
      !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { confirmPassword, ...signupData } = formData;
      const result = await authService.signup(signupData);

      if (result.success) {
        Alert.alert(
          "Account Created",
          "Your account has been created successfully! You can now sign in.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Signup Failed",
          result.error || "Please check your information and try again."
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
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
        <LoadingSpinner message="Creating your account..." overlay />
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            style={{ alignItems: "center", marginBottom: 32, marginTop: 20 }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Create Account
            </Text>
            <Text
              style={{ fontSize: 16, color: "#6B7280", textAlign: "center" }}
            >
              Join SelfPay and start optimizing your earnings
            </Text>
          </View>

          {/* Signup Form */}
          <View style={{ marginBottom: 32 }}>
            {/* Name Fields */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <FormInput
                  name="firstName"
                  label="First Name"
                  placeholder="First name"
                  value={formData.firstName || ""}
                  onChangeText={handleInputChange}
                  error={errors.firstName}
                  autoCapitalize="words"
                  autoComplete="given-name"
                  validation={{
                    required: true,
                    minLength: 2,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput
                  name="lastName"
                  label="Last Name"
                  placeholder="Last name"
                  value={formData.lastName || ""}
                  onChangeText={handleInputChange}
                  error={errors.lastName}
                  autoCapitalize="words"
                  autoComplete="family-name"
                  validation={{
                    required: true,
                    minLength: 2,
                  }}
                />
              </View>
            </View>

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
              name="phoneNumber"
              label="Phone Number (Optional)"
              placeholder="Enter your phone number"
              value={formData.phoneNumber || ""}
              onChangeText={handleInputChange}
              error={errors.phoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
              validation={{
                pattern: /^\+?[\d\s\-\(\)]+$/,
              }}
            />

            <FormInput
              name="password"
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={handleInputChange}
              error={errors.password}
              secureTextEntry
              autoComplete="new-password"
              helperText="Must be at least 8 characters with uppercase, lowercase, and number"
              validation={{
                required: true,
                minLength: 8,
                custom: (value: string) => {
                  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    return "Password must contain uppercase, lowercase, and number";
                  }
                  return null;
                },
              }}
            />

            <FormInput
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={handleInputChange}
              error={errors.confirmPassword}
              secureTextEntry
              autoComplete="new-password"
              validation={{
                required: true,
                custom: (value: string) => {
                  if (value !== formData.password) {
                    return "Passwords do not match";
                  }
                  return null;
                },
              }}
            />

            <FormButton
              type="submit"
              title="Create Account"
              onSubmit={handleSignup}
              validateForm={validateForm}
              size="large"
              style={{ marginTop: 8 }}
            />
          </View>

          {/* Terms and Privacy */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
                textAlign: "center",
                lineHeight: 18,
              }}
            >
              By creating an account, you agree to our{" "}
              <Text
                style={{ color: "#3B82F6", textDecorationLine: "underline" }}
              >
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text
                style={{ color: "#3B82F6", textDecorationLine: "underline" }}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>

          {/* Footer Link */}
          <View style={{ alignItems: "center", marginTop: "auto" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#6B7280", fontSize: 16 }}>
                Already have an account?{" "}
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

export default SignupScreen;
