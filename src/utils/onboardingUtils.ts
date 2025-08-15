/**
 * Onboarding Utilities
 * Helper functions for onboarding progress calculation and validation
 */

import {
  OnboardingResponses,
  OnboardingState,
  OnboardingStep,
  PersonalInfo,
  PlatformSelection,
  GoalSetting,
  PrivacyConsent,
  OnboardingPreferences,
} from "../types/onboarding";

/**
 * Onboarding step definitions
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Personal Information",
    description: "Tell us about yourself",
    component: "PersonalInfoScreen",
    isRequired: true,
    isCompleted: false,
  },
  {
    id: 2,
    title: "Platform Selection",
    description: "Choose your gig work platforms",
    component: "PlatformSelectionScreen",
    isRequired: true,
    isCompleted: false,
  },
  {
    id: 3,
    title: "Goal Setting",
    description: "Set your income and savings goals",
    component: "GoalSettingScreen",
    isRequired: true,
    isCompleted: false,
  },
  {
    id: 4,
    title: "Privacy Consent",
    description: "Review and accept privacy settings",
    component: "PrivacyConsentScreen",
    isRequired: true,
    isCompleted: false,
  },
  {
    id: 5,
    title: "Preferences",
    description: "Customize your app experience",
    component: "PreferencesScreen",
    isRequired: false,
    isCompleted: false,
  },
];

/**
 * Get onboarding step by ID
 */
export function getOnboardingStep(stepId: number): OnboardingStep | undefined {
  return ONBOARDING_STEPS.find((step) => step.id === stepId);
}

/**
 * Get all required onboarding steps
 */
export function getRequiredSteps(): OnboardingStep[] {
  return ONBOARDING_STEPS.filter((step) => step.isRequired);
}

/**
 * Get all optional onboarding steps
 */
export function getOptionalSteps(): OnboardingStep[] {
  return ONBOARDING_STEPS.filter((step) => !step.isRequired);
}

/**
 * Calculate onboarding completion percentage
 */
export function calculateCompletionPercentage(
  completedSteps: number[]
): number {
  const totalSteps = ONBOARDING_STEPS.length;
  return (completedSteps.length / totalSteps) * 100;
}

/**
 * Calculate required steps completion percentage
 */
export function calculateRequiredCompletionPercentage(
  completedSteps: number[]
): number {
  const requiredSteps = getRequiredSteps();
  const completedRequiredSteps = completedSteps.filter((stepId) =>
    requiredSteps.some((step) => step.id === stepId)
  );
  return (completedRequiredSteps.length / requiredSteps.length) * 100;
}

/**
 * Check if onboarding is complete (all required steps)
 */
export function isOnboardingComplete(completedSteps: number[]): boolean {
  const requiredStepIds = getRequiredSteps().map((step) => step.id);
  return requiredStepIds.every((stepId) => completedSteps.includes(stepId));
}

/**
 * Get next incomplete step
 */
export function getNextIncompleteStep(
  completedSteps: number[]
): OnboardingStep | null {
  for (const step of ONBOARDING_STEPS) {
    if (!completedSteps.includes(step.id)) {
      return step;
    }
  }
  return null;
}

/**
 * Get next required incomplete step
 */
export function getNextRequiredIncompleteStep(
  completedSteps: number[]
): OnboardingStep | null {
  const requiredSteps = getRequiredSteps();
  for (const step of requiredSteps) {
    if (!completedSteps.includes(step.id)) {
      return step;
    }
  }
  return null;
}

/**
 * Check if user can proceed to a specific step
 */
export function canProceedToStep(
  stepId: number,
  completedSteps: number[]
): boolean {
  // Can always go to step 1
  if (stepId === 1) return true;

  // Can proceed to a step if the previous step is completed
  const previousStepId = stepId - 1;
  return completedSteps.includes(previousStepId);
}

/**
 * Check if a step has required data
 */
export function hasStepData(
  stepId: number,
  responses: OnboardingResponses
): boolean {
  switch (stepId) {
    case 1:
      return !!responses.personalInfo;
    case 2:
      return !!responses.platformSelection;
    case 3:
      return !!responses.goalSetting;
    case 4:
      return !!responses.privacyConsent;
    case 5:
      return !!responses.preferences;
    default:
      return false;
  }
}

/**
 * Get step data from responses
 */
export function getStepData(
  stepId: number,
  responses: OnboardingResponses
): any {
  switch (stepId) {
    case 1:
      return responses.personalInfo;
    case 2:
      return responses.platformSelection;
    case 3:
      return responses.goalSetting;
    case 4:
      return responses.privacyConsent;
    case 5:
      return responses.preferences;
    default:
      return null;
  }
}

/**
 * Validate step data completeness
 */
export function isStepDataComplete(
  stepId: number,
  responses: OnboardingResponses
): boolean {
  const data = getStepData(stepId, responses);
  if (!data) return false;

  switch (stepId) {
    case 1: // Personal Info
      const personalInfo = data as PersonalInfo;
      return !!(personalInfo.firstName && personalInfo.lastName);

    case 2: // Platform Selection
      const platformSelection = data as PlatformSelection;
      return !!(
        platformSelection.selectedPlatforms?.length > 0 &&
        platformSelection.primaryPlatform &&
        platformSelection.experienceLevel
      );

    case 3: // Goal Setting
      const goalSetting = data as GoalSetting;
      return !!(
        goalSetting.weeklyIncomeGoal > 0 &&
        goalSetting.monthlyIncomeGoal > 0 &&
        goalSetting.targetHoursPerWeek > 0 &&
        goalSetting.motivations?.length > 0
      );

    case 4: // Privacy Consent
      const privacyConsent = data as PrivacyConsent;
      return !!(
        privacyConsent.dataCollection !== undefined &&
        privacyConsent.analytics !== undefined &&
        privacyConsent.marketing !== undefined &&
        privacyConsent.locationTracking !== undefined &&
        privacyConsent.consentDate
      );

    case 5: // Preferences (optional, so always complete if exists)
      return true;

    default:
      return false;
  }
}

/**
 * Get onboarding progress summary
 */
export function getOnboardingProgressSummary(
  responses: OnboardingResponses,
  completedSteps: number[]
): {
  totalSteps: number;
  completedSteps: number;
  requiredSteps: number;
  completedRequiredSteps: number;
  overallProgress: number;
  requiredProgress: number;
  isComplete: boolean;
  nextStep: OnboardingStep | null;
  nextRequiredStep: OnboardingStep | null;
} {
  const totalSteps = ONBOARDING_STEPS.length;
  const requiredSteps = getRequiredSteps().length;
  const completedRequiredSteps = completedSteps.filter((stepId) =>
    getRequiredSteps().some((step) => step.id === stepId)
  ).length;

  return {
    totalSteps,
    completedSteps: completedSteps.length,
    requiredSteps,
    completedRequiredSteps,
    overallProgress: calculateCompletionPercentage(completedSteps),
    requiredProgress: calculateRequiredCompletionPercentage(completedSteps),
    isComplete: isOnboardingComplete(completedSteps),
    nextStep: getNextIncompleteStep(completedSteps),
    nextRequiredStep: getNextRequiredIncompleteStep(completedSteps),
  };
}

/**
 * Generate step completion status array
 */
export function generateStepCompletionStatus(
  responses: OnboardingResponses,
  completedSteps: number[]
): Array<{
  step: OnboardingStep;
  isCompleted: boolean;
  hasData: boolean;
  isDataComplete: boolean;
  canAccess: boolean;
}> {
  return ONBOARDING_STEPS.map((step) => ({
    step,
    isCompleted: completedSteps.includes(step.id),
    hasData: hasStepData(step.id, responses),
    isDataComplete: isStepDataComplete(step.id, responses),
    canAccess: canProceedToStep(step.id, completedSteps),
  }));
}

/**
 * Estimate time to complete onboarding
 */
export function estimateTimeToComplete(completedSteps: number[]): {
  estimatedMinutes: number;
  remainingSteps: number;
} {
  const averageTimePerStep = 3; // minutes
  const remainingSteps = ONBOARDING_STEPS.length - completedSteps.length;

  return {
    estimatedMinutes: remainingSteps * averageTimePerStep,
    remainingSteps,
  };
}

/**
 * Get onboarding step navigation info
 */
export function getStepNavigationInfo(
  currentStep: number,
  completedSteps: number[]
): {
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextStepId: number | null;
  previousStepId: number | null;
  isFirstStep: boolean;
  isLastStep: boolean;
} {
  const totalSteps = ONBOARDING_STEPS.length;

  return {
    canGoNext:
      currentStep < totalSteps &&
      canProceedToStep(currentStep + 1, completedSteps),
    canGoPrevious: currentStep > 1,
    nextStepId: currentStep < totalSteps ? currentStep + 1 : null,
    previousStepId: currentStep > 1 ? currentStep - 1 : null,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
  };
}

/**
 * Validate onboarding state consistency
 */
export function validateOnboardingStateConsistency(
  responses: OnboardingResponses,
  completedSteps: number[]
): {
  isConsistent: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if completed steps have corresponding data
  for (const stepId of completedSteps) {
    if (!hasStepData(stepId, responses)) {
      issues.push(`Step ${stepId} is marked complete but has no data`);
    } else if (!isStepDataComplete(stepId, responses)) {
      issues.push(`Step ${stepId} is marked complete but data is incomplete`);
    }
  }

  // Check if steps with data are marked as completed
  for (let stepId = 1; stepId <= ONBOARDING_STEPS.length; stepId++) {
    if (
      hasStepData(stepId, responses) &&
      isStepDataComplete(stepId, responses)
    ) {
      if (!completedSteps.includes(stepId)) {
        issues.push(
          `Step ${stepId} has complete data but is not marked as completed`
        );
      }
    }
  }

  return {
    isConsistent: issues.length === 0,
    issues,
  };
}

export {};
