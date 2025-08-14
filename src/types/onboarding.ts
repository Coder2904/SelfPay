// Onboarding and user setup types

export interface OnboardingResponses {
  personalInfo?: PersonalInfo;
  platformSelection?: PlatformSelection;
  goalSetting?: GoalSetting;
  privacyConsent?: PrivacyConsent;
  preferences?: OnboardingPreferences;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
}

export interface PlatformSelection {
  selectedPlatforms: string[];
  primaryPlatform: string;
  experienceLevel: "beginner" | "intermediate" | "expert";
  workingHours?: {
    start: string;
    end: string;
    daysOfWeek: number[];
  };
}

export interface GoalSetting {
  weeklyIncomeGoal: number;
  monthlyIncomeGoal: number;
  savingsGoal?: number;
  targetHoursPerWeek: number;
  motivations: string[];
}

export interface PrivacyConsent {
  dataCollection: boolean;
  analytics: boolean;
  marketing: boolean;
  locationTracking: boolean;
  consentDate: string;
}

export interface OnboardingPreferences {
  enableNotifications: boolean;
  enableBiometric: boolean;
  theme: "light" | "dark" | "system";
  language: string;
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  responses: OnboardingResponses;
  isComplete: boolean;
  completedSteps: number[];
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: string;
  isRequired: boolean;
  isCompleted: boolean;
}

export {};
