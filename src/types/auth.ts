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

export {};
