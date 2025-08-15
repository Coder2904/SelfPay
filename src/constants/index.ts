/**
 * Application Constants
 * Configuration constants for SelfPay app
 */

// Mock data configuration
export const USE_MOCK_DATA = true;

// API Configuration
export const API_ENDPOINTS = {
  PLAID_BASE_URL: "https://sandbox.plaid.com",
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
} as const;

// RevenueCat Configuration
export const REVENUECAT_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "",
  PRODUCT_IDS: {
    PREMIUM_MONTHLY: "selfpay_premium_monthly",
    PREMIUM_YEARLY: "selfpay_premium_yearly",
    PRO_MONTHLY: "selfpay_pro_monthly",
    PRO_YEARLY: "selfpay_pro_yearly",
  },
} as const;

// Plaid Configuration
export const PLAID_CONFIG = {
  CLIENT_ID: process.env.EXPO_PUBLIC_PLAID_CLIENT_ID || "",
  SECRET: process.env.EXPO_PUBLIC_PLAID_SECRET || "",
  ENVIRONMENT: "sandbox" as const,
  PRODUCTS: ["transactions", "accounts"] as const,
  COUNTRY_CODES: ["US"] as const,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: "SelfPay",
  VERSION: "1.0.0",
  BUILD_NUMBER: 1,
  DEEP_LINK_SCHEME: "selfpay",
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: false, // Disabled for Week 1
  ENABLE_CRASH_REPORTING: false, // Disabled for Week 1
} as const;

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  REFRESH_THRESHOLD: 50,
  MAX_RETRY_ATTEMPTS: 3,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_PREFERENCES: "user_preferences",
  ONBOARDING_COMPLETE: "onboarding_complete",
  BIOMETRIC_ENABLED: "biometric_enabled",
} as const;

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PREMIUM: "premium",
  PRO: "pro",
} as const;

// Platform Types
export const PLATFORMS = {
  UBER: "uber",
  LYFT: "lyft",
  DOORDASH: "doordash",
  GRUBHUB: "grubhub",
  INSTACART: "instacart",
  POSTMATES: "postmates",
} as const;

// Mock Data Paths
export const MOCK_DATA_PATHS = {
  SURGE_DATA: "../mock/surgeData.json",
  INCOME_DATA: "../mock/incomeData.json",
  SUBSCRIPTION_DATA: "../mock/subscriptionData.json",
  AUTH_DATA: "../mock/authData.json",
} as const;

export {};
