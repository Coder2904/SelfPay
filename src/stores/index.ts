// Store exports
export { useAuthStore } from "./authStore";
export { useSubscriptionStore } from "./subscriptionStore";
export { useOnboardingStore } from "./onboardingStore";

// React Query exports
export {
  queryClient,
  queryKeys,
  cacheUtils,
  backgroundSync,
} from "./queryClient";
export { QueryProvider } from "./QueryProvider";

// Store utilities
export { StoreInitializer, useStoreInitializer } from "./storeInitializer";

// Re-export types for convenience
export type {
  AuthState,
  User,
  LoginCredentials,
  SignupCredentials,
} from "../types/auth";
export type {
  SubscriptionState,
  SubscriptionStatus,
  SubscriptionPlan,
} from "../types/subscription";
export type { OnboardingState, OnboardingResponses } from "../types/onboarding";

export {};
