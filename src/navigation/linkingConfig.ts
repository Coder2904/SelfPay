/**
 * Deep Linking Configuration
 * Handles deep links and URL routing for the app
 */

import type { LinkingOptions } from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation";
import { APP_CONFIG } from "../constants";

/**
 * Deep linking configuration for React Navigation
 */
export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [
    `${APP_CONFIG.DEEP_LINK_SCHEME}://`,
    `https://selfpay.app`,
    `https://www.selfpay.app`,
  ],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: "login",
          Signup: "signup",
          ForgotPassword: "forgot-password",
          BiometricSetup: "biometric-setup",
        },
      },
      Onboarding: {
        screens: {
          Welcome: "welcome",
          PersonalizationQuiz: "quiz",
          PlatformSelection: "platforms",
          GoalSetting: "goals",
          PrivacyConsent: "privacy",
          OnboardingComplete: "complete",
        },
      },
      App: {
        screens: {
          Dashboard: "dashboard",
          Optimization: "optimize",
          Income: {
            screens: {
              IncomeDashboard: "income",
              AccountConnection: "income/connect",
              TransactionHistory: "income/transactions",
              GoalSettings: "income/goals",
            },
          },
          Profile: {
            screens: {
              ProfileHome: "profile",
              Settings: "profile/settings",
              SubscriptionManagement: "profile/subscription",
              Privacy: "profile/privacy",
              Support: "profile/support",
            },
          },
        },
      },
      Paywall: {
        path: "upgrade",
        parse: {
          source: (source: string) => source || "unknown",
          feature: (feature: string) => feature || undefined,
        },
      },
    },
  },
};

/**
 * Common deep link URLs for the app
 */
export const DEEP_LINKS = {
  // Auth links
  LOGIN: `${APP_CONFIG.DEEP_LINK_SCHEME}://login`,
  SIGNUP: `${APP_CONFIG.DEEP_LINK_SCHEME}://signup`,
  FORGOT_PASSWORD: `${APP_CONFIG.DEEP_LINK_SCHEME}://forgot-password`,

  // Main app links
  DASHBOARD: `${APP_CONFIG.DEEP_LINK_SCHEME}://dashboard`,
  OPTIMIZATION: `${APP_CONFIG.DEEP_LINK_SCHEME}://optimize`,
  INCOME: `${APP_CONFIG.DEEP_LINK_SCHEME}://income`,
  PROFILE: `${APP_CONFIG.DEEP_LINK_SCHEME}://profile`,

  // Feature-specific links
  CONNECT_ACCOUNT: `${APP_CONFIG.DEEP_LINK_SCHEME}://income/connect`,
  TRANSACTION_HISTORY: `${APP_CONFIG.DEEP_LINK_SCHEME}://income/transactions`,
  SETTINGS: `${APP_CONFIG.DEEP_LINK_SCHEME}://profile/settings`,
  SUBSCRIPTION: `${APP_CONFIG.DEEP_LINK_SCHEME}://profile/subscription`,

  // Paywall links
  UPGRADE: `${APP_CONFIG.DEEP_LINK_SCHEME}://upgrade`,
  UPGRADE_FOR_FEATURE: (feature: string) =>
    `${APP_CONFIG.DEEP_LINK_SCHEME}://upgrade?feature=${feature}`,
} as const;

/**
 * Utility function to generate deep links with parameters
 */
export const generateDeepLink = (
  path: string,
  params?: Record<string, string | number>
): string => {
  const baseUrl = `${APP_CONFIG.DEEP_LINK_SCHEME}://${path}`;

  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${baseUrl}?${queryString}`;
};

/**
 * Utility function to parse deep link parameters
 */
export const parseDeepLinkParams = (url: string): Record<string, string> => {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = decodeURIComponent(value);
    });

    return params;
  } catch (error) {
    console.warn("Failed to parse deep link parameters:", error);
    return {};
  }
};

/**
 * Utility function to validate deep link format
 */
export const isValidDeepLink = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return (
      linkingConfig.prefixes?.some((prefix) =>
        url.startsWith(prefix.replace("://", "://"))
      ) || false
    );
  } catch (error) {
    return false;
  }
};

/**
 * Handle incoming deep links with analytics and validation
 */
export const handleDeepLink = (url: string): void => {
  if (!isValidDeepLink(url)) {
    console.warn("Invalid deep link format:", url);
    return;
  }

  const params = parseDeepLinkParams(url);

  // TODO: Add analytics tracking for deep link usage
  console.log("Deep link opened:", { url, params });

  // TODO: Add custom handling for specific deep link patterns
  // For example, handling authentication callbacks, payment confirmations, etc.
};

export {};
