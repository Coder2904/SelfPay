// React Navigation types

import type { NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
  Paywall: {
    source: string;
    feature?: string;
  };
};

// Auth Navigator
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  BiometricSetup: undefined;
};

// Onboarding Navigator
export type OnboardingStackParamList = {
  Welcome: undefined;
  PersonalizationQuiz: undefined;
  PlatformSelection: undefined;
  GoalSetting: undefined;
  PrivacyConsent: undefined;
  OnboardingComplete: undefined;
};

// Main App Tab Navigator
export type AppTabParamList = {
  Dashboard: undefined;
  Optimization: undefined;
  Income: NavigatorScreenParams<IncomeStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Income Stack Navigator
export type IncomeStackParamList = {
  IncomeDashboard: undefined;
  AccountConnection: undefined;
  TransactionHistory: {
    accountId?: string;
    platform?: string;
  };
  GoalSettings: undefined;
};

// Profile Stack Navigator
export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  SubscriptionManagement: undefined;
  Privacy: undefined;
  Support: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type OnboardingStackScreenProps<
  T extends keyof OnboardingStackParamList
> = NativeStackScreenProps<OnboardingStackParamList, T>;

export type AppTabScreenProps<T extends keyof AppTabParamList> =
  BottomTabScreenProps<AppTabParamList, T>;

export type IncomeStackScreenProps<T extends keyof IncomeStackParamList> =
  NativeStackScreenProps<IncomeStackParamList, T>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, T>;

// Navigation Prop Types
export type NavigationProps = {
  navigation: any;
  route: any;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export {};
