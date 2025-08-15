import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOnboardingStore } from "../stores/onboardingStore";
import { queryKeys } from "../stores/queryClient";
import { OnboardingResponses } from "../types/onboarding";

// Custom hook that combines onboarding store with React Query
export const useOnboarding = () => {
  const queryClient = useQueryClient();
  const onboardingStore = useOnboardingStore();

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      await onboardingStore.completeOnboarding();
    },
    onSuccess: () => {
      // Invalidate auth queries since onboarding affects user state
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.user,
      });

      // Invalidate subscription queries since onboarding might affect subscription
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.status,
      });
    },
    onError: (error) => {
      console.error("Failed to complete onboarding:", error);
    },
  });

  // Update response mutation (for individual step updates)
  const updateResponseMutation = useMutation({
    mutationFn: async ({ step, response }: { step: number; response: any }) => {
      await onboardingStore.updateResponse(step, response);
      onboardingStore.completeStep(step);
    },
    onError: (error) => {
      console.error("Failed to update onboarding response:", error);
    },
  });

  // Reset onboarding mutation
  const resetOnboardingMutation = useMutation({
    mutationFn: async () => {
      onboardingStore.resetOnboarding();
    },
    onSuccess: () => {
      // Clear any cached onboarding data
      queryClient.removeQueries({
        queryKey: queryKeys.onboarding.progress,
      });
    },
  });

  return {
    // State
    currentStep: onboardingStore.currentStep,
    totalSteps: onboardingStore.totalSteps,
    responses: onboardingStore.responses,
    isComplete: onboardingStore.isComplete,
    completedSteps: onboardingStore.completedSteps,

    // Computed state
    progress: onboardingStore.getProgress(),
    canGoNext: onboardingStore.canProceedToStep(
      onboardingStore.currentStep + 1
    ),
    canGoPrevious: onboardingStore.currentStep > 1,

    // Navigation actions
    setCurrentStep: onboardingStore.setCurrentStep,
    nextStep: onboardingStore.nextStep,
    previousStep: onboardingStore.previousStep,

    // Data actions
    updateResponse: updateResponseMutation.mutateAsync,
    completeStep: onboardingStore.completeStep,
    completeOnboarding: completeOnboardingMutation.mutateAsync,
    resetOnboarding: resetOnboardingMutation.mutateAsync,

    // Mutation states
    isCompletingOnboarding: completeOnboardingMutation.isPending,
    isUpdatingResponse: updateResponseMutation.isPending,
    isResetting: resetOnboardingMutation.isPending,

    // Utility functions
    getStepData: onboardingStore.getStepData,
    isStepCompleted: onboardingStore.isStepCompleted,
    canProceedToStep: onboardingStore.canProceedToStep,
    initialize: onboardingStore.initialize,

    // Error handling
    error:
      completeOnboardingMutation.error ||
      updateResponseMutation.error ||
      resetOnboardingMutation.error,
  };
};

export {};
