/**
 * Authentication Error Handling Utilities
 * User-friendly error messages and error categorization
 */

import { AuthError } from "../types/auth";

// Error codes and their user-friendly messages
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  invalid_credentials:
    "Invalid email or password. Please check your credentials and try again.",
  user_not_found: "No account found with this email address.",
  wrong_password: "Incorrect password. Please try again.",
  too_many_requests:
    "Too many login attempts. Please wait a few minutes before trying again.",
  account_locked:
    "Your account has been temporarily locked due to multiple failed login attempts.",

  // Registration errors
  email_already_exists: "An account with this email address already exists.",
  weak_password:
    "Password is too weak. Please use at least 8 characters with a mix of letters, numbers, and symbols.",
  invalid_email: "Please enter a valid email address.",
  signup_disabled: "New account registration is currently disabled.",

  // Email verification errors
  email_not_confirmed: "Please verify your email address before signing in.",
  confirmation_token_expired:
    "Email verification link has expired. Please request a new one.",
  invalid_confirmation_token:
    "Invalid verification link. Please request a new one.",

  // Password reset errors
  password_reset_failed:
    "Failed to send password reset email. Please try again.",
  invalid_reset_token: "Invalid or expired password reset link.",
  password_reset_expired:
    "Password reset link has expired. Please request a new one.",

  // Biometric authentication errors
  biometric_not_available:
    "Biometric authentication is not available on this device.",
  biometric_not_enrolled:
    "No biometric credentials are enrolled on this device.",
  biometric_authentication_failed:
    "Biometric authentication failed. Please try again.",
  biometric_cancelled: "Biometric authentication was cancelled.",
  biometric_lockout:
    "Biometric authentication is temporarily locked. Please try again later.",

  // Network and service errors
  network_error:
    "Network connection error. Please check your internet connection and try again.",
  service_unavailable:
    "Authentication service is temporarily unavailable. Please try again later.",
  timeout: "Request timed out. Please check your connection and try again.",

  // Generic errors
  unknown_error: "An unexpected error occurred. Please try again.",
  session_expired: "Your session has expired. Please sign in again.",
  invalid_token: "Invalid authentication token. Please sign in again.",
};

// Error categories for different handling
export enum AuthErrorCategory {
  AUTHENTICATION = "authentication",
  REGISTRATION = "registration",
  EMAIL_VERIFICATION = "email_verification",
  PASSWORD_RESET = "password_reset",
  BIOMETRIC = "biometric",
  NETWORK = "network",
  SESSION = "session",
  UNKNOWN = "unknown",
}

// Map error codes to categories
export const ERROR_CATEGORIES: Record<string, AuthErrorCategory> = {
  invalid_credentials: AuthErrorCategory.AUTHENTICATION,
  user_not_found: AuthErrorCategory.AUTHENTICATION,
  wrong_password: AuthErrorCategory.AUTHENTICATION,
  too_many_requests: AuthErrorCategory.AUTHENTICATION,
  account_locked: AuthErrorCategory.AUTHENTICATION,

  email_already_exists: AuthErrorCategory.REGISTRATION,
  weak_password: AuthErrorCategory.REGISTRATION,
  invalid_email: AuthErrorCategory.REGISTRATION,
  signup_disabled: AuthErrorCategory.REGISTRATION,

  email_not_confirmed: AuthErrorCategory.EMAIL_VERIFICATION,
  confirmation_token_expired: AuthErrorCategory.EMAIL_VERIFICATION,
  invalid_confirmation_token: AuthErrorCategory.EMAIL_VERIFICATION,

  password_reset_failed: AuthErrorCategory.PASSWORD_RESET,
  invalid_reset_token: AuthErrorCategory.PASSWORD_RESET,
  password_reset_expired: AuthErrorCategory.PASSWORD_RESET,

  biometric_not_available: AuthErrorCategory.BIOMETRIC,
  biometric_not_enrolled: AuthErrorCategory.BIOMETRIC,
  biometric_authentication_failed: AuthErrorCategory.BIOMETRIC,
  biometric_cancelled: AuthErrorCategory.BIOMETRIC,
  biometric_lockout: AuthErrorCategory.BIOMETRIC,

  network_error: AuthErrorCategory.NETWORK,
  service_unavailable: AuthErrorCategory.NETWORK,
  timeout: AuthErrorCategory.NETWORK,

  session_expired: AuthErrorCategory.SESSION,
  invalid_token: AuthErrorCategory.SESSION,
};

/**
 * Create a standardized AuthError object
 */
export function createAuthError(
  code: string,
  message?: string,
  details?: any
): AuthError {
  return {
    code,
    message:
      message || AUTH_ERROR_MESSAGES[code] || AUTH_ERROR_MESSAGES.unknown_error,
    details,
  };
}

/**
 * Get user-friendly error message for an error code
 */
export function getErrorMessage(code: string): string {
  return AUTH_ERROR_MESSAGES[code] || AUTH_ERROR_MESSAGES.unknown_error;
}

/**
 * Get error category for an error code
 */
export function getErrorCategory(code: string): AuthErrorCategory {
  return ERROR_CATEGORIES[code] || AuthErrorCategory.UNKNOWN;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(code: string): boolean {
  const retryableErrors = [
    "network_error",
    "service_unavailable",
    "timeout",
    "too_many_requests",
  ];
  return retryableErrors.includes(code);
}

/**
 * Check if error requires user action
 */
export function requiresUserAction(code: string): boolean {
  const userActionErrors = [
    "email_not_confirmed",
    "weak_password",
    "invalid_email",
    "biometric_not_enrolled",
    "session_expired",
  ];
  return userActionErrors.includes(code);
}

/**
 * Parse Supabase auth error to standardized format
 */
export function parseSupabaseError(error: any): AuthError {
  if (!error) {
    return createAuthError("unknown_error");
  }

  // Map common Supabase error messages to our error codes
  const message = error.message?.toLowerCase() || "";

  if (message.includes("invalid login credentials")) {
    return createAuthError("invalid_credentials", undefined, error);
  }

  if (message.includes("user not found")) {
    return createAuthError("user_not_found", undefined, error);
  }

  if (message.includes("email already registered")) {
    return createAuthError("email_already_exists", undefined, error);
  }

  if (message.includes("password should be at least")) {
    return createAuthError("weak_password", undefined, error);
  }

  if (message.includes("invalid email")) {
    return createAuthError("invalid_email", undefined, error);
  }

  if (message.includes("email not confirmed")) {
    return createAuthError("email_not_confirmed", undefined, error);
  }

  if (message.includes("token has expired")) {
    return createAuthError("confirmation_token_expired", undefined, error);
  }

  if (message.includes("network")) {
    return createAuthError("network_error", undefined, error);
  }

  // Default to unknown error with original message
  return createAuthError("unknown_error", error.message, error);
}

/**
 * Parse biometric authentication error
 */
export function parseBiometricError(error: any): AuthError {
  if (!error) {
    return createAuthError("biometric_authentication_failed");
  }

  const message = error.message?.toLowerCase() || "";

  if (message.includes("not available")) {
    return createAuthError("biometric_not_available", undefined, error);
  }

  if (message.includes("not enrolled")) {
    return createAuthError("biometric_not_enrolled", undefined, error);
  }

  if (message.includes("cancelled")) {
    return createAuthError("biometric_cancelled", undefined, error);
  }

  if (message.includes("lockout")) {
    return createAuthError("biometric_lockout", undefined, error);
  }

  return createAuthError(
    "biometric_authentication_failed",
    error.message,
    error
  );
}

/**
 * Format error for display to user
 */
export function formatErrorForDisplay(error: AuthError): string {
  return error.message;
}

/**
 * Check if error should be logged
 */
export function shouldLogError(error: AuthError): boolean {
  // Don't log user-caused errors
  const userErrors = [
    "invalid_credentials",
    "wrong_password",
    "biometric_cancelled",
    "weak_password",
    "invalid_email",
  ];

  return !userErrors.includes(error.code);
}

export {};
