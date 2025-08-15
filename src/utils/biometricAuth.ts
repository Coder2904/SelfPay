/**
 * Biometric Authentication Utilities
 * Handles biometric authentication setup and validation using Expo LocalAuthentication
 */

import * as LocalAuthentication from "expo-local-authentication";
import type { BiometricSettings } from "../types/auth";
import { FEATURE_FLAGS } from "../constants";

/**
 * Check if biometric authentication is available on the device
 */
export async function checkBiometricAvailability(): Promise<BiometricSettings> {
  try {
    if (!FEATURE_FLAGS.ENABLE_BIOMETRIC_AUTH) {
      return {
        isEnabled: false,
        isAvailable: false,
        supportedTypes: [],
      };
    }

    const isAvailable = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync();

    const supportedTypeNames = supportedTypes.map((type) => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return "fingerprint";
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return "face";
        case LocalAuthentication.AuthenticationType.IRIS:
          return "iris";
        default:
          return "unknown";
      }
    });

    return {
      isEnabled: false, // Will be set based on user preference
      isAvailable: isAvailable && isEnrolled,
      supportedTypes: supportedTypeNames,
    };
  } catch (error) {
    console.error("Failed to check biometric availability:", error);
    return {
      isEnabled: false,
      isAvailable: false,
      supportedTypes: [],
    };
  }
}

/**
 * Authenticate user using biometrics
 */
export async function authenticateWithBiometrics(
  promptMessage: string = "Authenticate to access SelfPay"
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!FEATURE_FLAGS.ENABLE_BIOMETRIC_AUTH) {
      return {
        success: false,
        error: "Biometric authentication is disabled",
      };
    }

    const biometricSettings = await checkBiometricAvailability();
    if (!biometricSettings.isAvailable) {
      return {
        success: false,
        error: "Biometric authentication is not available on this device",
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Cancel",
      fallbackLabel: "Use Password",
      disableDeviceFallback: false,
    });

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: "Biometric authentication failed",
      };
    }
  } catch (error) {
    console.error("Biometric authentication error:", error);
    return {
      success: false,
      error: "An error occurred during biometric authentication",
    };
  }
}

/**
 * Setup biometric authentication for the user
 */
export async function setupBiometricAuth(): Promise<{
  success: boolean;
  settings?: BiometricSettings;
  error?: string;
}> {
  try {
    const biometricSettings = await checkBiometricAvailability();

    if (!biometricSettings.isAvailable) {
      return {
        success: false,
        error: "Biometric authentication is not available on this device",
      };
    }

    // Test biometric authentication
    const authResult = await authenticateWithBiometrics(
      "Set up biometric authentication for SelfPay"
    );

    if (authResult.success) {
      return {
        success: true,
        settings: {
          ...biometricSettings,
          isEnabled: true,
        },
      };
    } else {
      return {
        success: false,
        error: authResult.error || "Failed to setup biometric authentication",
      };
    }
  } catch (error) {
    console.error("Failed to setup biometric authentication:", error);
    return {
      success: false,
      error: "An error occurred while setting up biometric authentication",
    };
  }
}

/**
 * Disable biometric authentication
 */
export async function disableBiometricAuth(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // In a real app, this might involve clearing biometric-specific tokens
    // For now, we just return success
    return { success: true };
  } catch (error) {
    console.error("Failed to disable biometric authentication:", error);
    return {
      success: false,
      error: "Failed to disable biometric authentication",
    };
  }
}

/**
 * Get user-friendly biometric type names
 */
export function getBiometricTypeDisplayName(types: string[]): string {
  if (types.length === 0) {
    return "Biometric Authentication";
  }

  if (types.includes("face")) {
    return "Face ID";
  } else if (types.includes("fingerprint")) {
    return "Touch ID";
  } else if (types.includes("iris")) {
    return "Iris Recognition";
  } else {
    return "Biometric Authentication";
  }
}

/**
 * Check if device supports any biometric authentication
 */
export async function deviceSupportsBiometrics(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch (error) {
    console.error("Failed to check biometric support:", error);
    return false;
  }
}

export {};
