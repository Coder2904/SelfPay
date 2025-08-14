// Main types export file

// Authentication types
export type {
  User,
  LoginCredentials,
  SignupCredentials,
  UserPreferences,
  AuthState,
  BiometricSettings,
  AuthTokens,
} from "./auth";

// Onboarding types
export type {
  OnboardingResponses,
  PersonalInfo,
  PlatformSelection,
  GoalSetting,
  PrivacyConsent,
  OnboardingPreferences,
  OnboardingState,
  OnboardingStep,
} from "./onboarding";

// Surge and optimization types
export type {
  SurgeData,
  Recommendation,
  SurgeZone,
  OptimizationData,
} from "./surge";

// Income tracking types
export type {
  Transaction,
  Account,
  IncomeSummary,
  IncomeData,
  GoalSettings,
  EarningsAnalytics,
} from "./income";

// Subscription types
export type {
  SubscriptionTier,
  SubscriptionStatus,
  SubscriptionPlan,
  SubscriptionFeature,
  PurchaseInfo,
  SubscriptionState,
  PaywallConfig,
} from "./subscription";

// Navigation types
export type {
  RootStackParamList,
  AuthStackParamList,
  OnboardingStackParamList,
  AppTabParamList,
  IncomeStackParamList,
  ProfileStackParamList,
  RootStackScreenProps,
  AuthStackScreenProps,
  OnboardingStackScreenProps,
  AppTabScreenProps,
  IncomeStackScreenProps,
  ProfileStackScreenProps,
  NavigationProps,
} from "./navigation";

// Common utility types
export type {
  Location,
  TimeWindow,
  DateRange,
  Platform,
  NotificationSettings,
  AppConfig,
  ErrorInfo,
  ChartDataPoint,
  ChartConfig,
  SortOrder,
  SortConfig,
  FilterConfig,
} from "./common";

// Additional utility types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

// Type validation utilities
export {
  isSurgeData,
  isRecommendation,
  isTransaction,
  isAccount,
  isIncomeSummary,
  isUser,
  isLoginCredentials,
  isSubscriptionStatus,
  isSubscriptionTier,
  validateMockData,
} from "./validation";

export {};
