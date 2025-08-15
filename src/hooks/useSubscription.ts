import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSubscriptionStore } from "../stores/subscriptionStore";
import { queryKeys } from "../stores/queryClient";
import { SubscriptionStatus, SubscriptionPlan } from "../types/subscription";

// Custom hook that combines subscription store with React Query
export const useSubscription = () => {
  const queryClient = useQueryClient();
  const subscriptionStore = useSubscriptionStore();

  // Query for subscription status
  const statusQuery = useQuery({
    queryKey: queryKeys.subscription.status,
    queryFn: async (): Promise<SubscriptionStatus> => {
      await subscriptionStore.checkStatus();
      return subscriptionStore.status;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  // Query for available plans
  const plansQuery = useQuery({
    queryKey: queryKeys.subscription.plans,
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      if (subscriptionStore.availablePlans.length === 0) {
        await subscriptionStore.initialize();
      }
      return subscriptionStore.availablePlans;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (plans don't change often)
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (productId: string) => {
      await subscriptionStore.purchase(productId);
    },
    onSuccess: () => {
      // Invalidate subscription status to get updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.status,
      });
    },
    onError: (error) => {
      console.error("Purchase failed:", error);
    },
  });

  // Restore purchases mutation
  const restoreMutation = useMutation({
    mutationFn: async () => {
      await subscriptionStore.restore();
    },
    onSuccess: () => {
      // Invalidate subscription status to get updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.status,
      });
    },
    onError: (error) => {
      console.error("Restore failed:", error);
    },
  });

  // Check status mutation (for manual refresh)
  const checkStatusMutation = useMutation({
    mutationFn: async () => {
      await subscriptionStore.checkStatus();
      return subscriptionStore.status;
    },
    onSuccess: (status) => {
      // Update cache with new status
      queryClient.setQueryData(queryKeys.subscription.status, status);
    },
  });

  return {
    // State
    status: subscriptionStore.status,
    availablePlans: subscriptionStore.availablePlans,
    isLoading:
      subscriptionStore.isLoading ||
      statusQuery.isLoading ||
      plansQuery.isLoading,
    error: subscriptionStore.error || statusQuery.error || plansQuery.error,
    lastChecked: subscriptionStore.lastChecked,

    // Computed state
    isActive: subscriptionStore.status.isActive,
    tier: subscriptionStore.status.tier,
    features: subscriptionStore.status.features,

    // Actions
    purchase: purchaseMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    checkStatus: checkStatusMutation.mutateAsync,

    // Mutation states
    isPurchaseLoading: purchaseMutation.isPending,
    isRestoreLoading: restoreMutation.isPending,
    isCheckingStatus: checkStatusMutation.isPending,

    // Utility functions
    hasFeature: subscriptionStore.hasFeature,
    canAccessFeature: subscriptionStore.canAccessFeature,
    clearError: subscriptionStore.clearError,
    initialize: subscriptionStore.initialize,

    // Query utilities
    refetchStatus: statusQuery.refetch,
    refetchPlans: plansQuery.refetch,
  };
};

export {};
