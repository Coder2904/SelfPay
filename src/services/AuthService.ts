/**
 * Authentication Service
 * Comprehensive authentication service with Supabase integration
 */

import {
  createClient,
  SupabaseClient,
  Session,
  User as SupabaseUser,
} from "@supabase/supabase-js";
import * as LocalAuthentication from "expo-local-authentication";
// Note: expo-crypto removed - using built-in crypto for token generation
import {
  User,
  LoginCredentials,
  SignupCredentials,
  SocialLoginCredentials,
  AuthResult,
  AuthTokens,
  AuthError,
  SessionData,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerificationRequest,
  BiometricAuthRequest,
  BiometricSettings,
  AuthEvent,
  AuthEventType,
} from "../types/auth";
import {
  storeAuthTokens,
  getAuthTokens,
  clearAuthTokens,
  storeBiometricEnabled,
  isBiometricEnabled,
  areTokensExpired,
  willTokensExpireSoon,
} from "../utils/secureStorage";
import { API_ENDPOINTS, USE_MOCK_DATA, FEATURE_FLAGS } from "../constants";

class AuthService {
  private supabase: SupabaseClient;
  private retryAttempts = 0;
  private maxRetries = 3;
  private eventListeners: ((event: AuthEvent) => void)[] = [];

  constructor() {
    this.supabase = createClient(
      API_ENDPOINTS.SUPABASE_URL,
      API_ENDPOINTS.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: false, // We handle persistence manually
          detectSessionInUrl: false,
        },
      }
    );

    // Set up auth state change listener
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.handleAuthStateChange(event as AuthEventType, session);
    });
  }

  /**
   * Initialize authentication service
   */
  async initialize(): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        // Mock initialization - just check stored tokens
        const tokens = await getAuthTokens();
        if (tokens && !areTokensExpired(tokens)) {
          // Tokens are valid, user is authenticated
          return;
        }
      } else {
        // Real Supabase initialization
        const {
          data: { session },
        } = await this.supabase.auth.getSession();
        if (session) {
          await this.handleSession(session);
        }
      }
    } catch (error) {
      console.error("Auth service initialization failed:", error);
      // Clear any corrupted data
      await clearAuthTokens();
    }
  }

  /**
   * Sign up with email and password
   */
  async signup(credentials: SignupCredentials): Promise<AuthResult> {
    try {
      this.retryAttempts = 0;

      if (USE_MOCK_DATA) {
        return this.mockSignup(credentials);
      }

      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName,
            last_name: credentials.lastName,
            phone_number: credentials.phoneNumber,
          },
        },
      });

      if (error) {
        throw this.createAuthError(error);
      }

      if (!data.user) {
        throw new Error("Signup failed - no user returned");
      }

      const user = this.mapSupabaseUser(data.user);

      // Check if email verification is required
      if (!data.session && data.user && !data.user.email_confirmed_at) {
        return {
          success: true,
          user,
          requiresEmailVerification: true,
        };
      }

      if (data.session) {
        const tokens = this.extractTokens(data.session);
        await storeAuthTokens(tokens);

        return {
          success: true,
          user,
          tokens,
        };
      }

      return {
        success: true,
        user,
        requiresEmailVerification: true,
      };
    } catch (error) {
      return this.handleAuthError(error, "signup");
    }
  }

  /**
   * Sign in with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      this.retryAttempts = 0;

      if (USE_MOCK_DATA) {
        return this.mockLogin(credentials);
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw this.createAuthError(error);
      }

      if (!data.user || !data.session) {
        throw new Error("Login failed - invalid response");
      }

      const user = this.mapSupabaseUser(data.user);
      const tokens = this.extractTokens(data.session);

      await storeAuthTokens(tokens);

      return {
        success: true,
        user,
        tokens,
      };
    } catch (error) {
      return this.handleAuthError(error, "login");
    }
  }

  /**
   * Social login (Google, Apple)
   */
  async socialLogin(credentials: SocialLoginCredentials): Promise<AuthResult> {
    try {
      if (USE_MOCK_DATA) {
        return this.mockSocialLogin(credentials);
      }

      const { data, error } = await this.supabase.auth.signInWithIdToken({
        provider: credentials.provider,
        token: credentials.idToken!,
        access_token: credentials.accessToken,
      });

      if (error) {
        throw this.createAuthError(error);
      }

      if (!data.user || !data.session) {
        throw new Error("Social login failed - invalid response");
      }

      const user = this.mapSupabaseUser(data.user);
      const tokens = this.extractTokens(data.session);

      await storeAuthTokens(tokens);

      return {
        success: true,
        user,
        tokens,
      };
    } catch (error) {
      return this.handleAuthError(error, "socialLogin");
    }
  }

  /**
   * Sign out
   */
  async logout(): Promise<void> {
    try {
      if (!USE_MOCK_DATA) {
        await this.supabase.auth.signOut();
      }

      await clearAuthTokens();

      // Emit signed out event
      this.emitAuthEvent("SIGNED_OUT", null, null);
    } catch (error) {
      console.error("Logout error:", error);
      // Always clear tokens even if logout fails
      await clearAuthTokens();
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshToken(): Promise<AuthResult> {
    try {
      if (USE_MOCK_DATA) {
        return this.mockRefreshToken();
      }

      const { data, error } = await this.supabase.auth.refreshSession();

      if (error) {
        throw this.createAuthError(error);
      }

      if (!data.session) {
        throw new Error("Token refresh failed - no session");
      }

      const tokens = this.extractTokens(data.session);
      await storeAuthTokens(tokens);

      return {
        success: true,
        tokens,
      };
    } catch (error) {
      return this.handleAuthError(error, "refreshToken");
    }
  }

  /**
   * Get current authentication status
   */
  async getAuthStatus(): Promise<{
    isAuthenticated: boolean;
    user?: User;
    tokens?: AuthTokens;
  }> {
    try {
      const tokens = await getAuthTokens();

      if (!tokens || areTokensExpired(tokens)) {
        return { isAuthenticated: false };
      }

      // If tokens expire soon, try to refresh
      if (willTokensExpireSoon(tokens)) {
        const refreshResult = await this.refreshToken();
        if (refreshResult.success && refreshResult.tokens) {
          return {
            isAuthenticated: true,
            tokens: refreshResult.tokens,
            user: refreshResult.user,
          };
        }
      }

      if (USE_MOCK_DATA) {
        const mockUser = await this.getMockUser();
        return {
          isAuthenticated: true,
          tokens,
          user: mockUser,
        };
      }

      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      return {
        isAuthenticated: !!user,
        tokens,
        user: user ? this.mapSupabaseUser(user) : undefined,
      };
    } catch (error) {
      console.error("Get auth status error:", error);
      return { isAuthenticated: false };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(
    request: PasswordResetRequest
  ): Promise<AuthResult> {
    try {
      if (USE_MOCK_DATA) {
        return { success: true };
      }

      const { error } = await this.supabase.auth.resetPasswordForEmail(
        request.email,
        {
          redirectTo: "selfpay://reset-password",
        }
      );

      if (error) {
        throw this.createAuthError(error);
      }

      return { success: true };
    } catch (error) {
      return this.handleAuthError(error, "requestPasswordReset");
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(
    request: PasswordResetConfirm
  ): Promise<AuthResult> {
    try {
      if (USE_MOCK_DATA) {
        return { success: true };
      }

      const { data, error } = await this.supabase.auth.updateUser({
        password: request.newPassword,
      });

      if (error) {
        throw this.createAuthError(error);
      }

      return {
        success: true,
        user: data.user ? this.mapSupabaseUser(data.user) : undefined,
      };
    } catch (error) {
      return this.handleAuthError(error, "confirmPasswordReset");
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(
    request: EmailVerificationRequest
  ): Promise<AuthResult> {
    try {
      if (USE_MOCK_DATA) {
        return { success: true };
      }

      const { error } = await this.supabase.auth.resend({
        type: "signup",
        email: request.email,
      });

      if (error) {
        throw this.createAuthError(error);
      }

      return { success: true };
    } catch (error) {
      return this.handleAuthError(error, "resendEmailVerification");
    }
  }

  /**
   * Get biometric settings
   */
  async getBiometricSettings(): Promise<BiometricSettings> {
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
      const isEnabled = await isBiometricEnabled();

      return {
        isEnabled: isEnabled && isAvailable && isEnrolled,
        isAvailable: isAvailable && isEnrolled,
        supportedTypes: supportedTypes.map(
          (type) => LocalAuthentication.AuthenticationType[type]
        ),
      };
    } catch (error) {
      console.error("Get biometric settings error:", error);
      return {
        isEnabled: false,
        isAvailable: false,
        supportedTypes: [],
      };
    }
  }

  /**
   * Authenticate with biometrics
   */
  async authenticateWithBiometrics(
    request: BiometricAuthRequest
  ): Promise<AuthResult> {
    try {
      if (!FEATURE_FLAGS.ENABLE_BIOMETRIC_AUTH) {
        throw new Error("Biometric authentication is disabled");
      }

      const biometricSettings = await this.getBiometricSettings();

      if (!biometricSettings.isAvailable) {
        throw new Error("Biometric authentication is not available");
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: request.reason,
        fallbackLabel: request.fallbackTitle || "Use Password",
        disableDeviceFallback: request.disableDeviceFallback || false,
      });

      if (!result.success) {
        throw new Error("Biometric authentication failed");
      }

      // Get stored tokens after successful biometric auth
      const tokens = await getAuthTokens();
      if (!tokens || areTokensExpired(tokens)) {
        throw new Error("No valid session found");
      }

      const authStatus = await this.getAuthStatus();

      return {
        success: true,
        user: authStatus.user,
        tokens: authStatus.tokens,
      };
    } catch (error) {
      return this.handleAuthError(error, "authenticateWithBiometrics");
    }
  }

  /**
   * Enable/disable biometric authentication
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await storeBiometricEnabled(enabled);
  }

  /**
   * Setup biometric authentication
   */
  async setupBiometric(): Promise<AuthResult> {
    try {
      if (!FEATURE_FLAGS.ENABLE_BIOMETRIC_AUTH) {
        return {
          success: false,
          error: "Biometric authentication is disabled",
        };
      }

      const biometricSettings = await this.getBiometricSettings();

      if (!biometricSettings.isAvailable) {
        return {
          success: false,
          error: "Biometric authentication is not available",
        };
      }

      // Test biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Set up biometric authentication for SelfPay",
        fallbackLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (!result.success) {
        return {
          success: false,
          error: "Biometric authentication setup was cancelled or failed",
        };
      }

      // Enable biometric authentication
      await this.setBiometricEnabled(true);

      return {
        success: true,
      };
    } catch (error) {
      return this.handleAuthError(error, "setupBiometric");
    }
  }

  /**
   * Add auth event listener
   */
  onAuthStateChange(callback: (event: AuthEvent) => void): () => void {
    this.eventListeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.eventListeners.indexOf(callback);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  // Private methods

  private async handleSession(session: Session): Promise<void> {
    const tokens = this.extractTokens(session);
    await storeAuthTokens(tokens);
  }

  private handleAuthStateChange(
    event: AuthEventType,
    session: Session | null
  ): void {
    const sessionData = session
      ? {
          user: this.mapSupabaseUser(session.user),
          tokens: this.extractTokens(session),
          expiresAt: new Date(session.expires_at! * 1000).getTime(),
        }
      : null;

    this.emitAuthEvent(event, sessionData, sessionData?.user || null);
  }

  private emitAuthEvent(
    type: AuthEventType,
    session: SessionData | null,
    user: User | null
  ): void {
    const event: AuthEvent = { type, session, user };
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Auth event listener error:", error);
      }
    });
  }

  private extractTokens(session: Session): AuthTokens {
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: new Date(session.expires_at! * 1000).getTime(),
    };
  }

  private mapSupabaseUser(supabaseUser: SupabaseUser): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      firstName: supabaseUser.user_metadata?.first_name,
      lastName: supabaseUser.user_metadata?.last_name,
      phoneNumber: supabaseUser.user_metadata?.phone_number,
      profilePicture: supabaseUser.user_metadata?.avatar_url,
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at!,
      emailVerified: !!supabaseUser.email_confirmed_at,
      lastSignInAt: supabaseUser.last_sign_in_at || undefined,
      provider: (supabaseUser.app_metadata?.provider as any) || "email",
    };
  }

  private createAuthError(error: any): AuthError {
    return {
      code: error.status?.toString() || "UNKNOWN_ERROR",
      message: error.message || "An unknown error occurred",
      details: error,
    };
  }

  private async handleAuthError(
    error: any,
    operation: string
  ): Promise<AuthResult> {
    console.error(`Auth ${operation} error:`, error);

    // Retry logic for network errors
    if (this.shouldRetry(error) && this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      await this.delay(1000 * this.retryAttempts);

      // Retry the operation based on type
      // This would need to be implemented per operation
      console.log(`Retrying ${operation}, attempt ${this.retryAttempts}`);
    }

    return {
      success: false,
      error: this.getErrorMessage(error),
    };
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, etc.
    return (
      error.code === "NETWORK_ERROR" ||
      error.code === "TIMEOUT" ||
      error.status >= 500
    );
  }

  private getErrorMessage(error: any): string {
    if (error.message) return error.message;
    if (error.error_description) return error.error_description;
    if (typeof error === "string") return error;
    return "An unexpected error occurred";
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Mock methods for development

  private async mockLogin(credentials: LoginCredentials): Promise<AuthResult> {
    // Simulate network delay
    await this.delay(1000);

    // Mock validation
    if (
      credentials.email === "test@example.com" &&
      credentials.password === "password123"
    ) {
      const mockUser = await this.getMockUser();
      const mockTokens = this.generateMockTokens();

      await storeAuthTokens(mockTokens);

      return {
        success: true,
        user: mockUser,
        tokens: mockTokens,
      };
    }

    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  private async mockSignup(
    credentials: SignupCredentials
  ): Promise<AuthResult> {
    await this.delay(1000);

    const mockUser: User = {
      id: `mock_user_${credentials.email.replace(/[^a-zA-Z0-9]/g, "_")}`,
      email: credentials.email,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      phoneNumber: credentials.phoneNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: false,
      provider: "email",
    };

    const mockTokens = this.generateMockTokens();
    await storeAuthTokens(mockTokens);

    return {
      success: true,
      user: mockUser,
      tokens: mockTokens,
    };
  }

  private async mockSocialLogin(
    credentials: SocialLoginCredentials
  ): Promise<AuthResult> {
    await this.delay(800);

    const mockUser: User = {
      id: "mock-social-user-id",
      email: "social@example.com",
      firstName: "Social",
      lastName: "User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      provider: credentials.provider,
    };

    const mockTokens = this.generateMockTokens();
    await storeAuthTokens(mockTokens);

    return {
      success: true,
      user: mockUser,
      tokens: mockTokens,
    };
  }

  private async mockRefreshToken(): Promise<AuthResult> {
    await this.delay(500);

    const mockTokens = this.generateMockTokens();
    await storeAuthTokens(mockTokens);

    return {
      success: true,
      tokens: mockTokens,
    };
  }

  private async getMockUser(): Promise<User> {
    return {
      id: "mock-user-id",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      provider: "email",
    };
  }

  private generateMockTokens(): AuthTokens {
    return {
      accessToken: "mock-access-token-" + Date.now(),
      refreshToken: "mock-refresh-token-" + Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    };
  }
}

// Export singleton instance and class
export const authService = new AuthService();
export { AuthService };

export {};
