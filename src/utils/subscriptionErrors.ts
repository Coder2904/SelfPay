/**
 * Subscription Error Handling Utilities
 * Provides error handling and user-friendly error messages for subscription operations
 */

import {
  SubscriptionError,
  PurchaseError,
  RestoreError,
} from "../services/SubscriptionService";

/**
 * Error codes for subscription operations
 */
export const SUBSCRIPTION_ERROR_CODES = {
  // General errors
  INIT_ERROR: "INIT_ERROR",
  STATUS_CHECK_ERROR: "STATUS_CHECK_ERROR",
  PLANS_FETCH_ERROR: "PLANS_FETCH_ERROR",
  USER_ID_ERROR: "USER_ID_ERROR",
  LOGOUT_ERROR: "LOGOUT_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Purchase errors
  PURCHASE_ERROR: "PURCHASE_ERROR",
  PURCHASE_NOT_IMPLEMENTED: "PURCHASE_NOT_IMPLEMENTED",
  PURCHASE_CANCELLED: "PURCHASE_CANCELLED",
  PURCHASE_PENDING: "PURCHASE_PENDING",
  PURCHASE_FAILED: "PURCHASE_FAILED",
  PRODUCT_NOT_AVAILABLE: "PRODUCT_NOT_AVAILABLE",
  PAYMENT_INVALID: "PAYMENT_INVALID",
  RECEIPT_INVALID: "RECEIPT_INVALID",

  // Restore errors
  RESTORE_ERROR: "RESTORE_ERROR",
  RESTORE_FAILED: "RESTORE_FAILED",
  NO_PURCHASES_TO_RESTORE: "NO_PURCHASES_TO_RESTORE",

  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  OFFLINE_ERROR: "OFFLINE_ERROR",

  // RevenueCat specific errors
  REVENUECAT_ERROR: "REVENUECAT_ERROR",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  STORE_PROBLEM: "STORE_PROBLEM",
  PURCHASE_NOT_ALLOWED: "PURCHASE_NOT_ALLOWED",
  PURCHASE_INVALID: "PURCHASE_INVALID",
  PRODUCT_NOT_AVAILABLE_FOR_PURCHASE: "PRODUCT_NOT_AVAILABLE_FOR_PURCHASE",
  PRODUCT_ALREADY_PURCHASED: "PRODUCT_ALREADY_PURCHASED",
  RECEIPT_ALREADY_IN_USE: "RECEIPT_ALREADY_IN_USE",
  INVALID_RECEIPT: "INVALID_RECEIPT",
  MISSING_RECEIPT_FILE: "MISSING_RECEIPT_FILE",
  NETWORK_ERROR_REVENUECAT: "NETWORK_ERROR_REVENUECAT",
  INVALID_CREDENTIALS_REVENUECAT: "INVALID_CREDENTIALS_REVENUECAT",
  UNEXPECTED_BACKEND_RESPONSE: "UNEXPECTED_BACKEND_RESPONSE",
  INVALID_APP_USER_ID: "INVALID_APP_USER_ID",
  OPERATION_ALREADY_IN_PROGRESS: "OPERATION_ALREADY_IN_PROGRESS",
  UNKNOWN_BACKEND_ERROR: "UNKNOWN_BACKEND_ERROR",
} as const;

export type SubscriptionErrorCode =
  (typeof SUBSCRIPTION_ERROR_CODES)[keyof typeof SUBSCRIPTION_ERROR_CODES];

/**
 * User-friendly error messages for subscription errors
 */
export const SUBSCRIPTION_ERROR_MESSAGES: Record<
  SubscriptionErrorCode,
  string
> = {
  // General errors
  INIT_ERROR:
    "Failed to initialize subscription service. Please restart the app and try again.",
  STATUS_CHECK_ERROR:
    "Unable to check your subscription status. Please check your internet connection and try again.",
  PLANS_FETCH_ERROR:
    "Unable to load subscription plans. Please check your internet connection and try again.",
  USER_ID_ERROR:
    "Failed to set up your subscription account. Please try logging out and back in.",
  LOGOUT_ERROR:
    "Failed to clear subscription data during logout. Your subscription status may not be accurate.",
  VALIDATION_ERROR:
    "Invalid subscription data received. Please contact support if this continues.",

  // Purchase errors
  PURCHASE_ERROR:
    "Purchase failed. Please try again or contact support if the problem persists.",
  PURCHASE_NOT_IMPLEMENTED:
    "Purchase functionality is not yet available. Please check for app updates.",
  PURCHASE_CANCELLED: "Purchase was cancelled. You can try again anytime.",
  PURCHASE_PENDING:
    "Your purchase is being processed. Please wait a moment and check your subscription status.",
  PURCHASE_FAILED:
    "Purchase could not be completed. Please check your payment method and try again.",
  PRODUCT_NOT_AVAILABLE:
    "This subscription plan is not currently available. Please try a different plan.",
  PAYMENT_INVALID:
    "Payment information is invalid. Please check your payment method and try again.",
  RECEIPT_INVALID:
    "Purchase receipt is invalid. Please contact support for assistance.",

  // Restore errors
  RESTORE_ERROR:
    "Failed to restore your purchases. Please try again or contact support.",
  RESTORE_FAILED:
    "Could not restore your previous purchases. Please check your internet connection and try again.",
  NO_PURCHASES_TO_RESTORE: "No previous purchases found to restore.",

  // Network errors
  NETWORK_ERROR:
    "Network connection error. Please check your internet connection and try again.",
  TIMEOUT_ERROR:
    "Request timed out. Please check your internet connection and try again.",
  OFFLINE_ERROR:
    "You appear to be offline. Please check your internet connection and try again.",

  // RevenueCat specific errors
  REVENUECAT_ERROR:
    "Subscription service error. Please try again or contact support.",
  CONFIGURATION_ERROR:
    "Subscription service is not properly configured. Please contact support.",
  INVALID_CREDENTIALS:
    "Invalid subscription service credentials. Please contact support.",
  STORE_PROBLEM: "App Store is experiencing issues. Please try again later.",
  PURCHASE_NOT_ALLOWED:
    "Purchases are not allowed on this device. Please check your device settings.",
  PURCHASE_INVALID:
    "This purchase is not valid. Please try again or contact support.",
  PRODUCT_NOT_AVAILABLE_FOR_PURCHASE:
    "This subscription is not available for purchase. Please try a different plan.",
  PRODUCT_ALREADY_PURCHASED:
    "You already have this subscription. Please check your subscription status.",
  RECEIPT_ALREADY_IN_USE:
    "This purchase receipt is already in use. Please contact support.",
  INVALID_RECEIPT: "Purchase receipt is invalid. Please contact support.",
  MISSING_RECEIPT_FILE:
    "Purchase receipt is missing. Please try purchasing again.",
  NETWORK_ERROR_REVENUECAT:
    "Network error connecting to subscription service. Please try again.",
  INVALID_CREDENTIALS_REVENUECAT:
    "Invalid subscription service credentials. Please contact support.",
  UNEXPECTED_BACKEND_RESPONSE:
    "Unexpected response from subscription service. Please try again.",
  INVALID_APP_USER_ID:
    "Invalid user ID for subscription service. Please try logging out and back in.",
  OPERATION_ALREADY_IN_PROGRESS:
    "A subscription operation is already in progress. Please wait and try again.",
  UNKNOWN_BACKEND_ERROR:
    "Unknown subscription service error. Please contact support.",
};

/**
 * Get user-friendly error message for subscription error
 */
export function getSubscriptionErrorMessage(error: Error): string {
  if (
    error instanceof SubscriptionError ||
    error instanceof PurchaseError ||
    error instanceof RestoreError
  ) {
    const message =
      SUBSCRIPTION_ERROR_MESSAGES[error.code as SubscriptionErrorCode];
    if (message) {
      return message;
    }
  }

  // Fallback to generic error message
  return (
    error.message ||
    "An unexpected error occurred. Please try again or contact support."
  );
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (
    error instanceof SubscriptionError ||
    error instanceof PurchaseError ||
    error instanceof RestoreError
  ) {
    const retryableCodes: SubscriptionErrorCode[] = [
      SUBSCRIPTION_ERROR_CODES.STATUS_CHECK_ERROR,
      SUBSCRIPTION_ERROR_CODES.PLANS_FETCH_ERROR,
      SUBSCRIPTION_ERROR_CODES.NETWORK_ERROR,
      SUBSCRIPTION_ERROR_CODES.TIMEOUT_ERROR,
      SUBSCRIPTION_ERROR_CODES.NETWORK_ERROR_REVENUECAT,
      SUBSCRIPTION_ERROR_CODES.UNEXPECTED_BACKEND_RESPONSE,
      SUBSCRIPTION_ERROR_CODES.UNKNOWN_BACKEND_ERROR,
    ];

    return retryableCodes.includes(error.code as SubscriptionErrorCode);
  }

  return false;
}

/**
 * Check if error requires user action
 */
export function requiresUserAction(error: Error): boolean {
  if (
    error instanceof SubscriptionError ||
    error instanceof PurchaseError ||
    error instanceof RestoreError
  ) {
    const userActionCodes: SubscriptionErrorCode[] = [
      SUBSCRIPTION_ERROR_CODES.PAYMENT_INVALID,
      SUBSCRIPTION_ERROR_CODES.PURCHASE_NOT_ALLOWED,
      SUBSCRIPTION_ERROR_CODES.INVALID_CREDENTIALS,
      SUBSCRIPTION_ERROR_CODES.USER_ID_ERROR,
      SUBSCRIPTION_ERROR_CODES.OFFLINE_ERROR,
    ];

    return userActionCodes.includes(error.code as SubscriptionErrorCode);
  }

  return false;
}

/**
 * Check if error should show contact support message
 */
export function shouldContactSupport(error: Error): boolean {
  if (
    error instanceof SubscriptionError ||
    error instanceof PurchaseError ||
    error instanceof RestoreError
  ) {
    const supportCodes: SubscriptionErrorCode[] = [
      SUBSCRIPTION_ERROR_CODES.CONFIGURATION_ERROR,
      SUBSCRIPTION_ERROR_CODES.INVALID_CREDENTIALS,
      SUBSCRIPTION_ERROR_CODES.RECEIPT_ALREADY_IN_USE,
      SUBSCRIPTION_ERROR_CODES.INVALID_RECEIPT,
      SUBSCRIPTION_ERROR_CODES.VALIDATION_ERROR,
      SUBSCRIPTION_ERROR_CODES.INVALID_CREDENTIALS_REVENUECAT,
    ];

    return supportCodes.includes(error.code as SubscriptionErrorCode);
  }

  return false;
}

/**
 * Create a standardized error response for UI components
 */
export interface SubscriptionErrorResponse {
  message: string;
  isRetryable: boolean;
  requiresUserAction: boolean;
  shouldContactSupport: boolean;
  originalError: Error;
}

export function createErrorResponse(error: Error): SubscriptionErrorResponse {
  return {
    message: getSubscriptionErrorMessage(error),
    isRetryable: isRetryableError(error),
    requiresUserAction: requiresUserAction(error),
    shouldContactSupport: shouldContactSupport(error),
    originalError: error,
  };
}

/**
 * Log subscription errors with appropriate level
 */
export function logSubscriptionError(error: Error, context?: string): void {
  const errorContext = context ? `[${context}]` : "";

  if (
    error instanceof SubscriptionError ||
    error instanceof PurchaseError ||
    error instanceof RestoreError
  ) {
    console.error(
      `${errorContext} Subscription Error [${error.code}]:`,
      error.message,
      error.originalError
    );
  } else {
    console.error(`${errorContext} Unexpected Subscription Error:`, error);
  }
}

/**
 * Utility to handle subscription errors in async operations
 */
export async function handleSubscriptionOperation<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logSubscriptionError(
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    throw error;
  }
}

export {};
