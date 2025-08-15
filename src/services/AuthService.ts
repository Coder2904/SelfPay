/**
 * Authentication Service
 * Handles Supabase authentication with mock data switching logic
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  User,
  LoginCredentials,
  SignupCredentials,
  AuthTokens,
  BiometricSettings,
} from "../types/auth";
import { USE_MOCK_DATA, API_ENDPOINTS } from "../constants";
import {
  storeAuthTokens,
  getAuthTokens,
  areTokensExpired,
  willTokensExpireSoon,
  storeUserPreferences,
  storeBiometricEnabled,
  isBiometricEnabled,
  clearAllUserData,
} from "../utils/secureStorage";
import {
  checkBiometricAvailability,
  authenticateWithBiometrics,
  setupBiometricAuth,
  disableBiometricAuth,
} from "../utils/biometricAuth";

// Mock data interface
interface MockAuthData {
  mockUsers: Array<User & { password: string }>;
  mockTokens: Record<string, AuthTokens>;
}

class AuthService {
  private supabase: SupabaseClient | null = null;
  private mockData: MockAuthData | null = null;

  constructor() {
    this.initializeSupabase();
    if (USE_MOCK_DATA) {
      this.loadMockData();
    }
  }

  /**
   * Initialize Supabase client
   */
  private initializeSupabase(): void {
    try {
      if (
        !USE_MOCK_DATA &&
        API_ENDPOINTS.SUPABASE_URL &&
        API_ENDPOINTS.SUPABASE_ANON_KEY
      ) {
        this.supabase = createClient(
          API_ENDPOINTS.SUPABASE_URL,
          API_ENDPOINTS.SUPABASE_ANON_KEY
        );
      }
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error);
    }
  }

  /**
   * Load mock authentication data
   */
  private async loadMockData(): Promise<void> {
    try {
      const mockAuthData = require("../../mock/authData.json") as MockAuthData;
      this.mockData = mockAuthData;
    } catch (error) {
      console.error("Failed to load mock auth data:", error);
      // Fallback mock data
      this.mockData = {
        mockUsers: [
          {
            id: "user_1",
            email: "demo@selfpay.com",
            password: "password123",
            firstName: "Demo",
            lastName: "User",
            phoneNumber: "+1234567890",
            profilePicture: undefined,
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-14T10:00:00Z",
            preferences: {
              enableBiometric: true,
              enableNotifications: true,
              preferredPlatforms: ["uber", "lyft"],
              theme: "system",
              language: "en",
            },
          },
        ],
        mockTokens: {
          user_1: {
            accessToken: "mock_access_token_user_1",
            refreshToken: "mock_refresh_token_user_1",
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
          },
        },
      };
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    error?: string;
  }> {
    try {
      if (USE_MOCK_DATA) {
        return this.mockLogin(credentials);
      } else {
        return this.supabaseLogin(credentials);
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "An unexpected error occurred during login",
      };
    }
  }

  /**
   * Mock login implementation
   */
  private async mockLogin(credentials: LoginCredentials): Promise<{
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    error?: string;
  }> {
    if (!this.mockData) {
      await this.loadMockData();
    }

    const mockUser = this.mockData?.mockUsers.find(
      (user) =>
        user.email === credentials.email &&
        user.password === credentials.password
    );

    if (!mockUser) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    const tokens = this.mockData?.mockTokens[mockUser.id];
    if (!tokens) {
      return {
        success: false,
        error: "Authentication tokens not found",
      };
    }

    // Store tokens securely
    await storeAuthTokens(tokens);

    // Store user preferences if they exist
    if (mockUser.preferences) {
      await storeUserPreferences(mockUser.preferences);
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = mockUser;

    return {
      success: true,
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Supabase login implementation
   */
  private async supabaseLogin(credentials: LoginCredentials): Promise<{
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    error?: string;
  }> {
    if (!this.supabase) {
      return {
        success: false,
        error: "Supabase client not initialized",
      };
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user || !data.session) {
      return {
        success: false,
        error: "Authentication failed",
      };
    }

    const tokens: AuthTokens = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at
        ? data.session.expires_at * 1000
        : Date.now() + 60 * 60 * 1000,
    };

    await storeAuthTokens(tokens);

    const user: User = {
      id: data.user.id,
      email: data.user.email || "",
      firstName: data.user.user_metadata?.firstName,
      lastName: data.user.user_metadata?.lastName,
      phoneNumber: data.user.phone,
      profilePicture: data.user.user_metadata?.profilePicture,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at || data.user.created_at,
      preferences: data.user.user_metadata?.preferences,
    };

    return {
      success: true,
      user,
      tokens,
    };
  }

  /**
   * Sign up new user
   */
  async signup(credentials: SignupCredentials): Promise<{
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    error?: string;
  }> {
    try {
      if (USE_MOCK_DATA) {
        return this.mockSignup(credentials);
      } else {
        return this.supabaseSignup(credentials);
      }
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        error: "An unexpected error occurred during signup",
      };
    }
  }

  /**
   * Mock signup implementation
   */
  private async mockSignup(credentials: SignupCredentials): Promise<{
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    error?: string;
  }> {
    if (!this.mockData) {
      await this.loadMockData();
    }

    // Check if user already exists
    const existingUser = this.mockData?.mockUsers.find(
      (user) => user.email === credentials.email
    );

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Create new mock user
    const newUserId = `user_${Date.now()}`;
    const newUser: User & { password: string } = {
      id: newUserId,
      email: credentials.email,
      password: credentials.password,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      phoneNumber: credentials.phoneNumber,
      profilePicture: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        enableBiometric: false,
        enableNotifications: true,
        preferredPlatforms: [],
        theme: "system",
        language: "en",
      },
    };

    // Create tokens for new user
    const tokens: AuthTokens = {
      accessToken: `mock_access_token_${newUserId}`,
      refreshToken: `mock_refresh_token_${newUserId}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    };

    // Store tokens securely
    await storeAuthTokens(tokens);

    // Store user preferences
    if (newUser.preferences) {
      await storeUserPreferences(newUser.preferences);
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = newUser;

    return {
      success: true,
      user: userWithoutPassword,
      tokens,
    };
  }

  /**
   * Supabase signup implementation
   */
  private async supabaseSignup(credentials: SignupCredentials): Promise<{
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    error?: string;
  }> {
    if (!this.supabase) {
      return {
        success: false,
        error: "Supabase client not initialized",
      };
    }

    const { data, error } = await this.supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          phoneNumber: credentials.phoneNumber,
          preferences: {
            enableBiometric: false,
            enableNotifications: true,
            preferredPlatforms: [],
            theme: "system",
            language: "en",
          },
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "User creation failed",
      };
    }

    // Handle email confirmation flow
    if (!data.session) {
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || "",
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          phoneNumber: credentials.phoneNumber,
          profilePicture: undefined,
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at || data.user.created_at,
        },
        // No tokens yet - user needs to confirm email
      };
    }

    const tokens: AuthTokens = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at
        ? data.session.expires_at * 1000
        : Date.now() + 60 * 60 * 1000,
    };

    await storeAuthTokens(tokens);

    const user: User = {
      id: data.user.id,
      email: data.user.email || "",
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      phoneNumber: credentials.phoneNumber,
      profilePicture: undefined,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at || data.user.created_at,
      preferences: data.user.user_metadata?.preferences,
    };

    return {
      success: true,
      user,
      tokens,
    };
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      if (USE_MOCK_DATA) {
        return this.mockLogout();
      } else {
        return this.supabaseLogout();
      }
    } catch (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: "An unexpected error occurred during logout",
      };
    }
  }

  /**
   * Mock logout implementation
   */
  private async mockLogout(): Promise<{ success: boolean; error?: string }> {
    await clearAllUserData();
    return { success: true };
  }

  /**
   * Supabase logout implementation
   */
  private async supabaseLogout(): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!this.supabase) {
      await clearAllUserData();
      return { success: true };
    }

    const { error } = await this.supabase.auth.signOut();
    await clearAllUserData();

    if (error) {
      console.error("Supabase logout error:", error);
      // Still return success since we cleared local data
    }

    return { success: true };
  }

  /**
   * Refresh authentication tokens
   */
  async refreshToken(): Promise<{
    success: boolean;
    tokens?: AuthTokens;
    error?: string;
  }> {
    try {
      if (USE_MOCK_DATA) {
        return this.mockRefreshToken();
      } else {
        return this.supabaseRefreshToken();
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      return {
        success: false,
        error: "An unexpected error occurred during token refresh",
      };
    }
  }

  /**
   * Mock token refresh implementation
   */
  private async mockRefreshToken(): Promise<{
    success: boolean;
    tokens?: AuthTokens;
    error?: string;
  }> {
    const currentTokens = await getAuthTokens();
    if (!currentTokens) {
      return {
        success: false,
        error: "No tokens found to refresh",
      };
    }

    // Generate new mock tokens
    const newTokens: AuthTokens = {
      accessToken: `refreshed_${currentTokens.accessToken}`,
      refreshToken: currentTokens.refreshToken, // Keep same refresh token
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    };

    await storeAuthTokens(newTokens);

    return {
      success: true,
      tokens: newTokens,
    };
  }

  /**
   * Supabase token refresh implementation
   */
  private async supabaseRefreshToken(): Promise<{
    success: boolean;
    tokens?: AuthTokens;
    error?: string;
  }> {
    if (!this.supabase) {
      return {
        success: false,
        error: "Supabase client not initialized",
      };
    }

    const { data, error } = await this.supabase.auth.refreshSession();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.session) {
      return {
        success: false,
        error: "Failed to refresh session",
      };
    }

    const tokens: AuthTokens = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at
        ? data.session.expires_at * 1000
        : Date.now() + 60 * 60 * 1000,
    };

    await storeAuthTokens(tokens);

    return {
      success: true,
      tokens,
    };
  }

  /**
   * Get current authentication status
   */
  async getAuthStatus(): Promise<{
    isAuthenticated: boolean;
    user?: User;
    tokens?: AuthTokens;
    needsRefresh?: boolean;
  }> {
    try {
      const tokens = await getAuthTokens();
      if (!tokens) {
        return { isAuthenticated: false };
      }

      if (areTokensExpired(tokens)) {
        return {
          isAuthenticated: false,
          needsRefresh: true,
        };
      }

      // TODO: Get user data from stored preferences or API
      // For now, return basic auth status
      return {
        isAuthenticated: true,
        tokens,
        needsRefresh: willTokensExpireSoon(tokens),
      };
    } catch (error) {
      console.error("Failed to get auth status:", error);
      return { isAuthenticated: false };
    }
  }

  /**
   * Setup biometric authentication
   */
  async setupBiometric(): Promise<{
    success: boolean;
    settings?: BiometricSettings;
    error?: string;
  }> {
    try {
      const result = await setupBiometricAuth();

      if (result.success && result.settings) {
        await storeBiometricEnabled(true);
      }

      return result;
    } catch (error) {
      console.error("Failed to setup biometric auth:", error);
      return {
        success: false,
        error: "Failed to setup biometric authentication",
      };
    }
  }

  /**
   * Authenticate with biometrics
   */
  async authenticateWithBiometric(): Promise<{
    success: boolean;
    user?: User;
    tokens?: AuthTokens;
    error?: string;
  }> {
    try {
      const isBiometricEnabledForUser = await isBiometricEnabled();
      if (!isBiometricEnabledForUser) {
        return {
          success: false,
          error: "Biometric authentication is not enabled",
        };
      }

      const authResult = await authenticateWithBiometrics();
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error,
        };
      }

      // Get stored tokens after successful biometric auth
      const tokens = await getAuthTokens();
      if (!tokens) {
        return {
          success: false,
          error: "No stored authentication found",
        };
      }

      if (areTokensExpired(tokens)) {
        // Try to refresh tokens
        const refreshResult = await this.refreshToken();
        if (!refreshResult.success) {
          return {
            success: false,
            error: "Authentication expired and refresh failed",
          };
        }
      }

      // TODO: Get user data from stored preferences
      return {
        success: true,
        tokens,
      };
    } catch (error) {
      console.error("Biometric authentication error:", error);
      return {
        success: false,
        error: "Biometric authentication failed",
      };
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await disableBiometricAuth();

      if (result.success) {
        await storeBiometricEnabled(false);
      }

      return result;
    } catch (error) {
      console.error("Failed to disable biometric auth:", error);
      return {
        success: false,
        error: "Failed to disable biometric authentication",
      };
    }
  }

  /**
   * Get biometric settings
   */
  async getBiometricSettings(): Promise<BiometricSettings> {
    try {
      const settings = await checkBiometricAvailability();
      const isEnabled = await isBiometricEnabled();

      return {
        ...settings,
        isEnabled,
      };
    } catch (error) {
      console.error("Failed to get biometric settings:", error);
      return {
        isEnabled: false,
        isAvailable: false,
        supportedTypes: [],
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };

// Default export for the service
export default authService;
