import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  OnboardingState,
  OnboardingResponses,
  OnboardingStep,
} from "../types/onboarding";
import { onboardingService } from "../services/OnboardingService";
import { ONBOARDING_STEPS } from "../utils/onboardingUtils";

interface OnboardingStore extends OnboardingState {
  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateResponse: (step: number, response: any) => void;
  completeStep: (step: number) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
  getStepData: (step: number) => OnboardingStep | undefined;
  isStepCompleted: (step: number) => boolean;
  canProceedToStep: (step: number) => boolean;
  getProgress: () => number;
  initialize: () => void;
}

// Onboarding steps are now imported from utils

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 1,
      totalSteps: ONBOARDING_STEPS.length,
      responses: {},
      isComplete: false,
      completedSteps: [],

      // Actions
      setCurrentStep: (step: number) => {
        const { totalSteps } = get();
        if (step >= 1 && step <= totalSteps) {
          set({ currentStep: step });
        }
      },

      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1 });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      updateResponse: async (step: number, response: any) => {
        try {
          const { responses } = get();

          // Update the specific step response
          const updatedResponses = { ...responses };

          switch (step) {
            case 1:
              updatedResponses.personalInfo = response;
              break;
            case 2:
              updatedResponses.platformSelection = response;
              break;
            case 3:
              updatedResponses.goalSetting = response;
              break;
            case 4:
              updatedResponses.privacyConsent = response;
              break;
            case 5:
              updatedResponses.preferences = response;
              break;
            default:
              console.warn(`Unknown onboarding step: ${step}`);
              return;
          }

          // Save to service
          await onboardingService.saveStepResponse(step, response);

          set({ responses: updatedResponses });
        } catch (error) {
          console.error("Failed to update onboarding response:", error);
          throw error;
        }
      },

      completeStep: (step: number) => {
        const { completedSteps } = get();

        if (!completedSteps.includes(step)) {
          const updatedCompletedSteps = [...completedSteps, step].sort(
            (a, b) => a - b
          );
          set({ completedSteps: updatedCompletedSteps });
        }
      },

      completeOnboarding: async () => {
        try {
          const { responses, completedSteps } = get();

          // Validate that all required steps are completed
          const requiredSteps = ONBOARDING_STEPS.filter(
            (step) => step.isRequired
          ).map((step) => step.id);
          const hasAllRequiredSteps = requiredSteps.every((stepId) =>
            completedSteps.includes(stepId)
          );

          if (!hasAllRequiredSteps) {
            throw new Error("Not all required onboarding steps are completed");
          }

          // Use onboarding service to complete onboarding
          await onboardingService.completeOnboarding(responses);

          set({ isComplete: true });
        } catch (error) {
          console.error("Failed to complete onboarding:", error);
          throw error;
        }
      },

      resetOnboarding: () => {
        set({
          currentStep: 1,
          responses: {},
          isComplete: false,
          completedSteps: [],
        });
      },

      getStepData: (step: number): OnboardingStep | undefined => {
        return ONBOARDING_STEPS.find((s) => s.id === step);
      },

      isStepCompleted: (step: number): boolean => {
        const { completedSteps } = get();
        return completedSteps.includes(step);
      },

      canProceedToStep: (step: number): boolean => {
        const { completedSteps } = get();

        // Can always go to step 1
        if (step === 1) return true;

        // Can proceed to a step if the previous step is completed
        // or if it's an optional step and we've completed at least the required steps before it
        const stepData = ONBOARDING_STEPS.find((s) => s.id === step);
        if (!stepData) return false;

        // Check if previous step is completed
        const previousStep = step - 1;
        return completedSteps.includes(previousStep);
      },

      getProgress: (): number => {
        const { completedSteps, totalSteps } = get();
        return (completedSteps.length / totalSteps) * 100;
      },

      initialize: async () => {
        try {
          // Initialize onboarding service
          await onboardingService.initialize();

          // Load stored onboarding data
          const storedData = await onboardingService.getStoredOnboardingData();
          const isComplete = await onboardingService.isOnboardingComplete();

          if (storedData) {
            set({
              responses: storedData,
              isComplete,
            });
          }

          // Validate existing data and clean up if necessary
          const { responses, completedSteps } = get();
          if (
            Object.keys(responses).length === 0 &&
            completedSteps.length > 0
          ) {
            // Reset if we have completed steps but no responses (data corruption)
            set({ completedSteps: [] });
          }
        } catch (error) {
          console.error("Failed to initialize onboarding store:", error);
        }
      },
    }),
    {
      name: "onboarding-store",
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
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
      // Persist all onboarding state
      partialize: (state) => ({
        currentStep: state.currentStep,
        responses: state.responses,
        isComplete: state.isComplete,
        completedSteps: state.completedSteps,
      }),
    }
  )
);

export {};
