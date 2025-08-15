/**
 * Secure Storage Utilities
 * Wrapper around Expo SecureStore for token and sensitive data management
 */

import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../constants";
import type { AuthTokens, UserPreferences } from "../types/auth";

/**
 * Securely store authentication tokens
 */
export async function storeAuthTokens(tokens: AuthTokens): Promise<void> {
  try {
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken),
      SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      SecureStore.setItemAsync("token_expires_at", tokens.expiresAt.toString()),
    ]);
  } catch (error) {
    console.error("Failed to store auth tokens:", error);
    throw new Error("Failed to store authentication tokens securely");
  }
}

/**
 * Retrieve stored authentication tokens
 */
export async function getAuthTokens(): Promise<AuthTokens | null> {
  try {
    const [accessToken, refreshToken, expiresAtStr] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync("token_expires_at"),
    ]);

    if (!accessToken || !refreshToken || !expiresAtStr) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: parseInt(expiresAtStr, 10),
    };
  } catch (error) {
    console.error("Failed to retrieve auth tokens:", error);
    return null;
  }
}

/**
 * Clear all stored authentication tokens
 */
export async function clearAuthTokens(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync("token_expires_at"),
    ]);
  } catch (error) {
    console.error("Failed to clear auth tokens:", error);
    // Don't throw error for cleanup operations
  }
}

/**
 * Store user preferences securely
 */
export async function storeUserPreferences(
  preferences: UserPreferences
): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      STORAGE_KEYS.USER_PREFERENCES,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error("Failed to store user preferences:", error);
    throw new Error("Failed to store user preferences securely");
  }
}

/**
 * Retrieve stored user preferences
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const preferencesStr = await SecureStore.getItemAsync(
      STORAGE_KEYS.USER_PREFERENCES
    );
    if (!preferencesStr) {
      return null;
    }
    return JSON.parse(preferencesStr) as UserPreferences;
  } catch (error) {
    console.error("Failed to retrieve user preferences:", error);
    return null;
  }
}

/**
 * Store biometric authentication status
 */
export async function storeBiometricEnabled(enabled: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      STORAGE_KEYS.BIOMETRIC_ENABLED,
      enabled.toString()
    );
  } catch (error) {
    console.error("Failed to store biometric status:", error);
    throw new Error("Failed to store biometric authentication status");
  }
}

/**
 * Check if biometric authentication is enabled
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await SecureStore.getItemAsync(
      STORAGE_KEYS.BIOMETRIC_ENABLED
    );
    return enabled === "true";
  } catch (error) {
    console.error("Failed to check biometric status:", error);
    return false;
  }
}

/**
 * Clear all stored user data
 */
export async function clearAllUserData(): Promise<void> {
  try {
    await Promise.all([
      clearAuthTokens(),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PREFERENCES),
      SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED),
      SecureStore.deleteItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETE),
    ]);
  } catch (error) {
    console.error("Failed to clear user data:", error);
    // Don't throw error for cleanup operations
  }
}

/**
 * Check if tokens are expired
 */
export function areTokensExpired(tokens: AuthTokens): boolean {
  return Date.now() >= tokens.expiresAt;
}

/**
 * Check if tokens will expire soon (within 5 minutes)
 */
export function willTokensExpireSoon(tokens: AuthTokens): boolean {
  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
  return fiveMinutesFromNow >= tokens.expiresAt;
}

/**
 * Generic secure data storage
 */
export async function storeData(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Failed to store data for key ${key}:`, error);
    throw new Error(`Failed to store data securely for key: ${key}`);
  }
}

/**
 * Generic secure data retrieval
 */
export async function getData(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Failed to retrieve data for key ${key}:`, error);
    return null;
  }
}

/**
 * Generic secure data removal
 */
export async function removeData(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Failed to remove data for key ${key}:`, error);
    // Don't throw error for cleanup operations
  }
}

export {};
