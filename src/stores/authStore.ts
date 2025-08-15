import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  User,
  LoginCredentials,
  SignupCredentials,
  AuthTokens,
} from "../types/auth";
import { authService } from "../services/AuthService";
import {
  storeAuthTokens,
  getAuthTokens,
  clearAllUserData,
  getUserPreferences,
  storeUserPreferences,
} from "../utils/secureStorage";

interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null,
      refreshToken: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const result = await authService.login(credentials);

          if (!result.success) {
            throw new Error(result.error || "Login failed");
          }

          if (result.user && result.tokens) {
            set({
              user: result.user,
              isAuthenticated: true,
              accessToken: result.tokens.accessToken,
              refreshToken: result.tokens.refreshToken,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          throw error;
        }
      },

      signup: async (credentials: SignupCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const result = await authService.signup(credentials);

          if (!result.success) {
            throw new Error(result.error || "Signup failed");
          }

          if (result.user && result.tokens) {
            set({
              user: result.user,
              isAuthenticated: true,
              accessToken: result.tokens.accessToken,
              refreshToken: result.tokens.refreshToken,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Signup failed",
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          await authService.logout();

          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Logout failed",
          });
        }
      },

      refreshTokens: async () => {
        try {
          set({ isLoading: true });

          const result = await authService.refreshToken();

          if (!result.success) {
            throw new Error(result.error || "Token refresh failed");
          }

          if (result.tokens) {
            set({
              accessToken: result.tokens.accessToken,
              refreshToken: result.tokens.refreshToken,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: (tokens: AuthTokens | null) => {
        set({
          accessToken: tokens?.accessToken || null,
          refreshToken: tokens?.refreshToken || null,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: async () => {
        try {
          set({ isLoading: true });

          const authStatus = await authService.getAuthStatus();

          if (authStatus.isAuthenticated && authStatus.tokens) {
            // Get user preferences
            const preferences = await getUserPreferences();

            // Create user object with preferences
            const user: User | null = authStatus.user || null;
            if (user && preferences) {
              user.preferences = preferences;
            }

            set({
              user,
              isAuthenticated: true,
              accessToken: authStatus.tokens.accessToken,
              refreshToken: authStatus.tokens.refreshToken,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              isAuthenticated: false,
              user: null,
              accessToken: null,
              refreshToken: null,
            });
          }
        } catch (error) {
          // If initialization fails, clear everything
          await clearAllUserData();

          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null,
          });
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          // Use regular storage for non-sensitive data
          try {
            const item = localStorage.getItem(name);
            return item;
          } catch {
            return null;
          }
        },
        setItem: async (name: string, value: string) => {
          try {
            localStorage.setItem(name, value);
          } catch {
            // Ignore storage errors
          }
        },
        removeItem: async (name: string) => {
          try {
            localStorage.removeItem(name);
          } catch {
            // Ignore storage errors
          }
        },
      })),
      // Only persist non-sensitive user data, not tokens
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export {};
