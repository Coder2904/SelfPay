import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { queryKeys } from "../stores/queryClient";
import { authService } from "../services/AuthService";
import {
  LoginCredentials,
  SignupCredentials,
  SocialLoginCredentials,
  User,
  BiometricSettings,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerificationRequest,
  BiometricAuthRequest,
  AuthEvent,
} from "../types/auth";

// Custom hook that combines auth store with React Query and comprehensive auth features
export const useAuth = () => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);

  // Set up auth event listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((event) => {
      setAuthEvents((prev) => [...prev.slice(-9), event]); // Keep last 10 events

      // Handle specific events
      switch (event.type) {
        case "SIGNED_IN":
          if (event.user) {
            authStore.setUser(event.user);
            if (event.session?.tokens) {
              authStore.setTokens(event.session.tokens);
            }
          }
          break;
        case "SIGNED_OUT":
          authStore.setUser(null);
          authStore.setTokens(null);
          queryClient.clear();
          break;
        case "TOKEN_REFRESHED":
          if (event.session?.tokens) {
            authStore.setTokens(event.session.tokens);
          }
          break;
      }
    });

    return unsubscribe;
  }, [authStore, queryClient]);

  // Query for current user data
  const userQuery = useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: async (): Promise<User | null> => {
      // If we have a user in store, return it
      if (authStore.user) {
        return authStore.user;
      }

      // Otherwise, try to initialize auth store
      await authStore.initialize();
      return authStore.user;
    },
    enabled: authStore.isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Query for biometric settings
  const biometricQuery = useQuery({
    queryKey: queryKeys.auth.biometric,
    queryFn: () => authService.getBiometricSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await authService.login(credentials);
      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      if (result.user && result.tokens) {
        authStore.setUser(result.user);
        authStore.setTokens(result.tokens);
      }

      return result;
    },
    onSuccess: (result) => {
      // Update user query cache
      queryClient.setQueryData(queryKeys.auth.user, result.user);

      // Invalidate other queries that depend on auth
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.status,
      });
    },
    onError: (error) => {
      console.error("Login failed:", error);
      authStore.setError(
        error instanceof Error ? error.message : "Login failed"
      );
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      const result = await authService.signup(credentials);
      if (!result.success) {
        throw new Error(result.error || "Signup failed");
      }

      if (result.user && result.tokens) {
        authStore.setUser(result.user);
        authStore.setTokens(result.tokens);
      }

      return result;
    },
    onSuccess: (result) => {
      // Update user query cache
      queryClient.setQueryData(queryKeys.auth.user, result.user);

      // Invalidate other queries that depend on auth
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.status,
      });
    },
    onError: (error) => {
      console.error("Signup failed:", error);
      authStore.setError(
        error instanceof Error ? error.message : "Signup failed"
      );
    },
  });

  // Social login mutation
  const socialLoginMutation = useMutation({
    mutationFn: async (credentials: SocialLoginCredentials) => {
      const result = await authService.socialLogin(credentials);
      if (!result.success) {
        throw new Error(result.error || "Social login failed");
      }

      if (result.user && result.tokens) {
        authStore.setUser(result.user);
        authStore.setTokens(result.tokens);
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.auth.user, result.user);
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.status,
      });
    },
    onError: (error) => {
      console.error("Social login failed:", error);
      authStore.setError(
        error instanceof Error ? error.message : "Social login failed"
      );
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      const result = await authService.refreshToken();
      if (!result.success) {
        throw new Error(result.error || "Token refresh failed");
      }

      if (result.tokens) {
        authStore.setTokens(result.tokens);
      }

      return result;
    },
    onError: (error) => {
      console.error("Token refresh failed:", error);
      // On refresh failure, logout user
      authService.logout();
      queryClient.clear();
    },
  });

  // Password reset request mutation
  const passwordResetMutation = useMutation({
    mutationFn: async (request: PasswordResetRequest) => {
      const result = await authService.requestPasswordReset(request);
      if (!result.success) {
        throw new Error(result.error || "Password reset request failed");
      }
      return result;
    },
  });

  // Password reset confirm mutation
  const passwordResetConfirmMutation = useMutation({
    mutationFn: async (request: PasswordResetConfirm) => {
      const result = await authService.confirmPasswordReset(request);
      if (!result.success) {
        throw new Error(result.error || "Password reset confirmation failed");
      }
      return result;
    },
  });

  // Email verification mutation
  const emailVerificationMutation = useMutation({
    mutationFn: async (request: EmailVerificationRequest) => {
      const result = await authService.resendEmailVerification(request);
      if (!result.success) {
        throw new Error(result.error || "Email verification failed");
      }
      return result;
    },
  });

  // Biometric authentication mutation
  const biometricAuthMutation = useMutation({
    mutationFn: async (request: BiometricAuthRequest) => {
      const result = await authService.authenticateWithBiometrics(request);
      if (!result.success) {
        throw new Error(result.error || "Biometric authentication failed");
      }

      if (result.user && result.tokens) {
        authStore.setUser(result.user);
        authStore.setTokens(result.tokens);
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.auth.user, result.user);
    },
  });

  // Biometric settings mutation
  const setBiometricMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await authService.setBiometricEnabled(enabled);
      return enabled;
    },
    onSuccess: () => {
      // Refetch biometric settings
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.biometric,
      });
    },
  });

  return {
    // State
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading || userQuery.isLoading,
    error: authStore.error || userQuery.error,
    biometricSettings: biometricQuery.data,
    authEvents,

    // Core authentication actions
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    socialLogin: socialLoginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshTokens: refreshTokenMutation.mutateAsync,

    // Password management
    requestPasswordReset: passwordResetMutation.mutateAsync,
    confirmPasswordReset: passwordResetConfirmMutation.mutateAsync,
    resendEmailVerification: emailVerificationMutation.mutateAsync,

    // Biometric authentication
    authenticateWithBiometrics: biometricAuthMutation.mutateAsync,
    setBiometricEnabled: setBiometricMutation.mutateAsync,

    // Loading states
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
    isSocialLoginLoading: socialLoginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isPasswordResetLoading: passwordResetMutation.isPending,
    isPasswordResetConfirmLoading: passwordResetConfirmMutation.isPending,
    isEmailVerificationLoading: emailVerificationMutation.isPending,
    isBiometricAuthLoading: biometricAuthMutation.isPending,
    isBiometricSettingsLoading: biometricQuery.isLoading,

    // Error states
    loginError: loginMutation.error,
    signupError: signupMutation.error,
    socialLoginError: socialLoginMutation.error,
    passwordResetError: passwordResetMutation.error,
    biometricError: biometricAuthMutation.error,

    // Utility functions
    clearError: authStore.clearError,
    initialize: authStore.initialize,

    // Auth service methods for direct access
    getAuthStatus: authService.getAuthStatus.bind(authService),
    getBiometricSettings: authService.getBiometricSettings.bind(authService),
  };
};

export {};
