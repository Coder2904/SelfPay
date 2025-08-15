// Authentication and user-related types

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
  emailVerified?: boolean;
  lastSignInAt?: string;
  provider?: AuthProvider;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface SocialLoginCredentials {
  provider: "google" | "apple";
  idToken?: string;
  accessToken?: string;
}

export interface UserPreferences {
  enableBiometric: boolean;
  enableNotifications: boolean;
  preferredPlatforms: string[];
  defaultLocation?: {
    lat: number;
    lng: number;
    name: string;
  };
  theme: "light" | "dark" | "system";
  language: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface BiometricSettings {
  isEnabled: boolean;
  isAvailable: boolean;
  supportedTypes: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  error?: string;
  requiresEmailVerification?: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface SessionData {
  user: User;
  tokens: AuthTokens;
  expiresAt: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface BiometricAuthRequest {
  reason: string;
  fallbackTitle?: string;
  disableDeviceFallback?: boolean;
}

export type AuthProvider = "email" | "google" | "apple" | "anonymous";

export type AuthEventType =
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "PASSWORD_RECOVERY";

export interface AuthEvent {
  type: AuthEventType;
  session: SessionData | null;
  user: User | null;
}

export {};
