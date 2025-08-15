/**
 * Onboarding Service
 * Comprehensive onboarding service with personalization quiz logic and data persistence
 */

import {
  OnboardingResponses,
  PersonalInfo,
  PlatformSelection,
  GoalSetting,
  PrivacyConsent,
  OnboardingPreferences,
  OnboardingState,
  OnboardingStep,
} from "../types/onboarding";
import { USE_MOCK_DATA, STORAGE_KEYS, PLATFORMS } from "../constants";
import { storeData, getData, removeData } from "../utils/secureStorage";

export interface OnboardingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OnboardingQuizQuestion {
  id: string;
  type: "single" | "multiple" | "text" | "number" | "boolean";
  question: string;
  options?: string[];
  required: boolean;
  category: "personal" | "platform" | "goals" | "privacy" | "preferences";
}

export interface OnboardingAnalytics {
  completionRate: number;
  averageTimePerStep: number;
  dropOffPoints: number[];
  mostSelectedPlatforms: string[];
  averageIncomeGoal: number;
}

class OnboardingService {
  private retryAttempts = 0;
  private maxRetries = 3;

  constructor() {
    // Initialize service
  }

  /**
   * Initialize onboarding service
   */
  async initialize(): Promise<void> {
    try {
      // Validate existing onboarding data
      const existingData = await this.getStoredOnboardingData();
      if (existingData) {
        const validation = await this.validateOnboardingData(existingData);
        if (!validation.isValid) {
          console.warn(
            "Invalid onboarding data found, clearing:",
            validation.errors
          );
          await this.clearOnboardingData();
        }
      }
    } catch (error) {
      console.error("Onboarding service initialization failed:", error);
      // Clear any corrupted data
      await this.clearOnboardingData();
    }
  }

  /**
   * Get personalization quiz questions
   */
  getPersonalizationQuiz(): OnboardingQuizQuestion[] {
    return [
      {
        id: "experience_level",
        type: "single",
        question: "How experienced are you with gig work?",
        options: ["Just starting out", "Some experience", "Very experienced"],
        required: true,
        category: "personal",
      },
      {
        id: "work_motivation",
        type: "multiple",
        question: "What motivates you to do gig work? (Select all that apply)",
        options: [
          "Extra income",
          "Flexible schedule",
          "Main source of income",
          "Building savings",
          "Paying off debt",
          "Fun and social interaction",
        ],
        required: true,
        category: "personal",
      },
      {
        id: "work_schedule",
        type: "single",
        question: "When do you prefer to work?",
        options: [
          "Mornings (6AM - 12PM)",
          "Afternoons (12PM - 6PM)",
          "Evenings (6PM - 12AM)",
          "Late nights (12AM - 6AM)",
          "Flexible/varies",
        ],
        required: true,
        category: "personal",
      },
      {
        id: "income_priority",
        type: "single",
        question: "What's most important to you?",
        options: [
          "Maximizing earnings per hour",
          "Consistent daily income",
          "Flexible working hours",
          "Minimizing expenses (gas, wear)",
        ],
        required: true,
        category: "goals",
      },
    ];
  }

  /**
   * Get available platforms for selection
   */
  getAvailablePlatforms(): Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    estimatedHourlyRange: string;
  }> {
    return [
      {
        id: PLATFORMS.UBER,
        name: "Uber",
        category: "rideshare",
        description: "Rideshare driving",
        estimatedHourlyRange: "$15-25",
      },
      {
        id: PLATFORMS.LYFT,
        name: "Lyft",
        category: "rideshare",
        description: "Rideshare driving",
        estimatedHourlyRange: "$15-25",
      },
      {
        id: PLATFORMS.DOORDASH,
        name: "DoorDash",
        category: "delivery",
        description: "Food delivery",
        estimatedHourlyRange: "$12-20",
      },
      {
        id: PLATFORMS.GRUBHUB,
        name: "Grubhub",
        category: "delivery",
        description: "Food delivery",
        estimatedHourlyRange: "$12-20",
      },
      {
        id: PLATFORMS.INSTACART,
        name: "Instacart",
        category: "delivery",
        description: "Grocery delivery",
        estimatedHourlyRange: "$10-18",
      },
      {
        id: PLATFORMS.POSTMATES,
        name: "Postmates",
        category: "delivery",
        description: "General delivery",
        estimatedHourlyRange: "$10-18",
      },
    ];
  }

  /**
   * Validate personal information step
   */
  validatePersonalInfo(personalInfo: PersonalInfo): OnboardingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!personalInfo.firstName?.trim()) {
      errors.push("First name is required");
    }
    if (!personalInfo.lastName?.trim()) {
      errors.push("Last name is required");
    }

    // Optional field validation
    if (personalInfo.phoneNumber) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(personalInfo.phoneNumber)) {
        errors.push("Please enter a valid phone number");
      }
    }

    // Name length validation
    if (personalInfo.firstName && personalInfo.firstName.length > 50) {
      errors.push("First name must be less than 50 characters");
    }
    if (personalInfo.lastName && personalInfo.lastName.length > 50) {
      errors.push("Last name must be less than 50 characters");
    }

    // Location validation
    if (personalInfo.location) {
      if (!personalInfo.location.city?.trim()) {
        warnings.push("City information helps provide better recommendations");
      }
      if (!personalInfo.location.state?.trim()) {
        warnings.push("State information helps provide better recommendations");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate platform selection step
   */
  validatePlatformSelection(
    platformSelection: PlatformSelection
  ): OnboardingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (
      !platformSelection.selectedPlatforms ||
      platformSelection.selectedPlatforms.length === 0
    ) {
      errors.push("Please select at least one platform");
    }

    if (!platformSelection.primaryPlatform) {
      errors.push("Please select a primary platform");
    }

    if (!platformSelection.experienceLevel) {
      errors.push("Please select your experience level");
    }

    // Validation logic
    if (
      platformSelection.selectedPlatforms &&
      platformSelection.primaryPlatform
    ) {
      if (
        !platformSelection.selectedPlatforms.includes(
          platformSelection.primaryPlatform
        )
      ) {
        errors.push("Primary platform must be one of your selected platforms");
      }
    }

    // Working hours validation
    if (platformSelection.workingHours) {
      const { start, end, daysOfWeek } = platformSelection.workingHours;

      if (start && end) {
        const startTime = new Date(`2000-01-01T${start}`);
        const endTime = new Date(`2000-01-01T${end}`);

        if (startTime >= endTime) {
          errors.push("End time must be after start time");
        }
      }

      if (daysOfWeek && daysOfWeek.length === 0) {
        warnings.push(
          "Consider selecting working days for better recommendations"
        );
      }
    }

    // Platform-specific warnings
    if (platformSelection.selectedPlatforms) {
      const rideshareCount = platformSelection.selectedPlatforms.filter((p) =>
        [PLATFORMS.UBER, PLATFORMS.LYFT].includes(p as any)
      ).length;

      const deliveryCount = platformSelection.selectedPlatforms.filter((p) =>
        [
          PLATFORMS.DOORDASH,
          PLATFORMS.GRUBHUB,
          PLATFORMS.INSTACART,
          PLATFORMS.POSTMATES,
        ].includes(p as any)
      ).length;

      if (rideshareCount > 0 && deliveryCount > 0) {
        warnings.push(
          "Managing both rideshare and delivery platforms can be complex"
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate goal setting step
   */
  validateGoalSetting(goalSetting: GoalSetting): OnboardingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!goalSetting.weeklyIncomeGoal || goalSetting.weeklyIncomeGoal <= 0) {
      errors.push("Please enter a valid weekly income goal");
    }

    if (!goalSetting.monthlyIncomeGoal || goalSetting.monthlyIncomeGoal <= 0) {
      errors.push("Please enter a valid monthly income goal");
    }

    if (
      !goalSetting.targetHoursPerWeek ||
      goalSetting.targetHoursPerWeek <= 0
    ) {
      errors.push("Please enter target hours per week");
    }

    if (!goalSetting.motivations || goalSetting.motivations.length === 0) {
      errors.push("Please select at least one motivation");
    }

    // Logical validation
    if (goalSetting.weeklyIncomeGoal && goalSetting.monthlyIncomeGoal) {
      const expectedMonthly = goalSetting.weeklyIncomeGoal * 4.33; // Average weeks per month
      const difference = Math.abs(
        goalSetting.monthlyIncomeGoal - expectedMonthly
      );
      const percentDifference = (difference / expectedMonthly) * 100;

      if (percentDifference > 25) {
        warnings.push(
          "Your weekly and monthly goals don't align. Consider adjusting them."
        );
      }
    }

    // Realistic goal validation
    if (goalSetting.weeklyIncomeGoal && goalSetting.targetHoursPerWeek) {
      const hourlyRate =
        goalSetting.weeklyIncomeGoal / goalSetting.targetHoursPerWeek;

      if (hourlyRate < 8) {
        warnings.push(
          "Your hourly rate goal is below minimum wage in most areas"
        );
      } else if (hourlyRate > 50) {
        warnings.push("Your hourly rate goal is quite ambitious for gig work");
      }
    }

    // Hours validation
    if (goalSetting.targetHoursPerWeek > 60) {
      warnings.push("Working more than 60 hours per week can lead to burnout");
    }

    // Savings goal validation
    if (goalSetting.savingsGoal) {
      if (goalSetting.savingsGoal < 0) {
        errors.push("Savings goal cannot be negative");
      }

      if (
        goalSetting.monthlyIncomeGoal &&
        goalSetting.savingsGoal > goalSetting.monthlyIncomeGoal
      ) {
        warnings.push("Your savings goal is higher than your income goal");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate privacy consent step
   */
  validatePrivacyConsent(
    privacyConsent: PrivacyConsent
  ): OnboardingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required consent
    if (privacyConsent.dataCollection === undefined) {
      errors.push("Please indicate your consent for data collection");
    }

    if (privacyConsent.analytics === undefined) {
      errors.push("Please indicate your consent for analytics");
    }

    if (privacyConsent.marketing === undefined) {
      errors.push("Please indicate your consent for marketing communications");
    }

    if (privacyConsent.locationTracking === undefined) {
      errors.push("Please indicate your consent for location tracking");
    }

    if (!privacyConsent.consentDate) {
      errors.push("Consent date is required");
    }

    // Warnings for optimal experience
    if (privacyConsent.dataCollection === false) {
      warnings.push("Disabling data collection may limit app functionality");
    }

    if (privacyConsent.locationTracking === false) {
      warnings.push(
        "Location tracking is essential for surge pricing and recommendations"
      );
    }

    if (privacyConsent.analytics === false) {
      warnings.push("Analytics help us improve the app experience");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate preferences step
   */
  validatePreferences(
    preferences: OnboardingPreferences
  ): OnboardingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // All preferences are optional, but validate format
    if (
      preferences.theme &&
      !["light", "dark", "system"].includes(preferences.theme)
    ) {
      errors.push("Invalid theme selection");
    }

    if (preferences.language && preferences.language.length !== 2) {
      errors.push("Language code must be 2 characters (e.g., 'en', 'es')");
    }

    // Recommendations
    if (preferences.enableNotifications === false) {
      warnings.push(
        "Notifications help you stay informed about earning opportunities"
      );
    }

    if (preferences.enableBiometric === false) {
      warnings.push("Biometric authentication provides better security");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate onboarding progress
   */
  calculateProgress(
    responses: OnboardingResponses,
    completedSteps: number[]
  ): {
    percentage: number;
    completedSteps: number;
    totalSteps: number;
    nextStep: number | null;
    isComplete: boolean;
  } {
    const totalSteps = 5; // Personal, Platform, Goals, Privacy, Preferences
    const completed = completedSteps.length;
    const percentage = (completed / totalSteps) * 100;

    // Find next incomplete step
    let nextStep: number | null = null;
    for (let i = 1; i <= totalSteps; i++) {
      if (!completedSteps.includes(i)) {
        nextStep = i;
        break;
      }
    }

    // Check if all required steps are complete (steps 1-4 are required)
    const requiredSteps = [1, 2, 3, 4];
    const isComplete = requiredSteps.every((step) =>
      completedSteps.includes(step)
    );

    return {
      percentage,
      completedSteps: completed,
      totalSteps,
      nextStep,
      isComplete,
    };
  }

  /**
   * Validate complete onboarding data
   */
  async validateOnboardingData(
    responses: OnboardingResponses
  ): Promise<OnboardingValidationResult> {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // Validate each step if data exists
    if (responses.personalInfo) {
      const result = this.validatePersonalInfo(responses.personalInfo);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    if (responses.platformSelection) {
      const result = this.validatePlatformSelection(
        responses.platformSelection
      );
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    if (responses.goalSetting) {
      const result = this.validateGoalSetting(responses.goalSetting);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    if (responses.privacyConsent) {
      const result = this.validatePrivacyConsent(responses.privacyConsent);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    if (responses.preferences) {
      const result = this.validatePreferences(responses.preferences);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  /**
   * Save onboarding response for a specific step
   */
  async saveStepResponse(step: number, response: any): Promise<void> {
    try {
      const existingData = (await this.getStoredOnboardingData()) || {};

      // Update the specific step response
      switch (step) {
        case 1:
          existingData.personalInfo = response as PersonalInfo;
          break;
        case 2:
          existingData.platformSelection = response as PlatformSelection;
          break;
        case 3:
          existingData.goalSetting = response as GoalSetting;
          break;
        case 4:
          existingData.privacyConsent = response as PrivacyConsent;
          break;
        case 5:
          existingData.preferences = response as OnboardingPreferences;
          break;
        default:
          throw new Error(`Invalid onboarding step: ${step}`);
      }

      await this.saveOnboardingData(existingData);
    } catch (error) {
      console.error("Failed to save step response:", error);
      throw error;
    }
  }

  /**
   * Save complete onboarding data
   */
  async saveOnboardingData(responses: OnboardingResponses): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        await storeData(
          STORAGE_KEYS.USER_PREFERENCES,
          JSON.stringify(responses)
        );
      } else {
        // TODO: Send to backend API
        await storeData(
          STORAGE_KEYS.USER_PREFERENCES,
          JSON.stringify(responses)
        );
      }
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
      throw error;
    }
  }

  /**
   * Get stored onboarding data
   */
  async getStoredOnboardingData(): Promise<OnboardingResponses | null> {
    try {
      const data = await getData(STORAGE_KEYS.USER_PREFERENCES);
      if (data) {
        return JSON.parse(data) as OnboardingResponses;
      }
      return null;
    } catch (error) {
      console.error("Failed to get stored onboarding data:", error);
      return null;
    }
  }

  /**
   * Clear all onboarding data
   */
  async clearOnboardingData(): Promise<void> {
    try {
      await removeData(STORAGE_KEYS.USER_PREFERENCES);
      await removeData(STORAGE_KEYS.ONBOARDING_COMPLETE);
    } catch (error) {
      console.error("Failed to clear onboarding data:", error);
      throw error;
    }
  }

  /**
   * Mark onboarding as complete
   */
  async completeOnboarding(responses: OnboardingResponses): Promise<void> {
    try {
      // Validate all data before completing
      const validation = await this.validateOnboardingData(responses);
      if (!validation.isValid) {
        throw new Error(
          `Onboarding validation failed: ${validation.errors.join(", ")}`
        );
      }

      // Save final data
      await this.saveOnboardingData(responses);

      // Mark as complete
      await storeData(STORAGE_KEYS.ONBOARDING_COMPLETE, "true");

      if (USE_MOCK_DATA) {
        console.log("Mock onboarding completed successfully");
      } else {
        // TODO: Send completion event to backend
        console.log("Onboarding completed successfully");
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      throw error;
    }
  }

  /**
   * Check if onboarding is complete
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const isComplete = await getData(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return isComplete === "true";
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      return false;
    }
  }

  /**
   * Get onboarding analytics (mock implementation)
   */
  async getOnboardingAnalytics(): Promise<OnboardingAnalytics> {
    // TODO: Implement real analytics when backend is available
    return {
      completionRate: 0.75,
      averageTimePerStep: 120, // seconds
      dropOffPoints: [2, 3], // Steps where users commonly drop off
      mostSelectedPlatforms: [
        PLATFORMS.UBER,
        PLATFORMS.DOORDASH,
        PLATFORMS.LYFT,
      ],
      averageIncomeGoal: 800, // weekly
    };
  }

  /**
   * Generate personalized recommendations based on onboarding responses
   */
  generatePersonalizedRecommendations(responses: OnboardingResponses): {
    platforms: string[];
    workingHours: string[];
    strategies: string[];
  } {
    const recommendations = {
      platforms: [] as string[],
      workingHours: [] as string[],
      strategies: [] as string[],
    };

    // Platform recommendations
    if (responses.platformSelection?.selectedPlatforms) {
      recommendations.platforms = responses.platformSelection.selectedPlatforms;
    }

    // Working hours recommendations
    if (responses.personalInfo || responses.platformSelection?.workingHours) {
      recommendations.workingHours = [
        "Focus on peak hours (lunch and dinner)",
        "Consider weekend surge periods",
        "Monitor local event schedules",
      ];
    }

    // Strategy recommendations based on goals
    if (responses.goalSetting) {
      const { weeklyIncomeGoal, targetHoursPerWeek } = responses.goalSetting;

      if (weeklyIncomeGoal && targetHoursPerWeek) {
        const targetHourlyRate = weeklyIncomeGoal / targetHoursPerWeek;

        if (targetHourlyRate > 20) {
          recommendations.strategies.push(
            "Focus on high-surge areas and premium services"
          );
        }

        if (targetHoursPerWeek > 40) {
          recommendations.strategies.push(
            "Consider multi-platform strategy for consistent income"
          );
        }
      }

      if (responses.goalSetting.motivations?.includes("Extra income")) {
        recommendations.strategies.push(
          "Optimize for part-time high-value hours"
        );
      }
    }

    return recommendations;
  }
}

// Export singleton instance and class
export const onboardingService = new OnboardingService();
export { OnboardingService };

export {};
