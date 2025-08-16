import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  SubscriptionState,
  SubscriptionStatus,
  SubscriptionPlan,
  PurchaseInfo,
} from "../types/subscription";
import { subscriptionService } from "../services/SubscriptionService";

interface SubscriptionStore extends SubscriptionState {
  // Actions
  checkStatus: () => Promise<void>;
  purchase: (productId: string) => Promise<void>;
  restore: () => Promise<PurchaseInfo[]>;
  setStatus: (status: SubscriptionStatus) => void;
  setPlans: (plans: SubscriptionPlan[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
  hasFeature: (featureId: string) => boolean;
  canAccessFeature: (requiredTier: "free" | "premium" | "pro") => boolean;
  setUserId: (userId: string) => Promise<void>;
  clearUserId: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      status: {
        isActive: false,
        tier: "free",
        features: [],
      },
      availablePlans: [],
      isLoading: false,
      error: null,
      lastChecked: undefined,

      // Actions
      checkStatus: async () => {
        try {
          set({ isLoading: true, error: null });

          const status = await subscriptionService.checkSubscriptionStatus();

          // Validate subscription status
          if (!subscriptionService.validateSubscription(status)) {
            throw new Error("Invalid subscription status received");
          }

          set({
            status,
            isLoading: false,
            lastChecked: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Failed to check subscription status:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to check subscription status",
          });
        }
      },

      purchase: async (productId: string) => {
        try {
          set({ isLoading: true, error: null });

          const purchaseInfo = await subscriptionService.purchaseProduct(
            productId
          );

          // Refresh subscription status after purchase
          await get().checkStatus();

          set({ isLoading: false });
        } catch (error) {
          console.error("Purchase failed:", error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Purchase failed",
          });
          throw error;
        }
      },

      restore: async () => {
        try {
          set({ isLoading: true, error: null });

          const purchases = await subscriptionService.restorePurchases();

          if (purchases.length > 0) {
            // Refresh subscription status after restore
            await get().checkStatus();
          }

          set({ isLoading: false });
          return purchases;
        } catch (error) {
          console.error("Restore failed:", error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Restore failed",
          });
          throw error;
        }
      },

      setStatus: (status: SubscriptionStatus) => {
        set({ status });
      },

      setPlans: (plans: SubscriptionPlan[]) => {
        set({ availablePlans: plans });
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

          // Load available plans
          const plans = await subscriptionService.getAvailablePlans();
          set({ availablePlans: plans });

          // Check current subscription status
          await get().checkStatus();
        } catch (error) {
          console.error("Failed to initialize subscription store:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to initialize subscription store",
          });
        }
      },

      setUserId: async (userId: string) => {
        try {
          await subscriptionService.setUserId(userId);
          // Refresh subscription status after setting user ID
          await get().checkStatus();
        } catch (error) {
          console.error("Failed to set user ID:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to set user ID",
          });
          throw error;
        }
      },

      clearUserId: async () => {
        try {
          await subscriptionService.clearUserId();
          // Reset to default free status after logout
          set({
            status: {
              isActive: false,
              tier: "free",
              features: ["basic_tracking", "limited_recommendations"],
            },
          });
        } catch (error) {
          console.error("Failed to clear user ID:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to clear user ID",
          });
          throw error;
        }
      },

      hasFeature: (featureId: string): boolean => {
        const { status } = get();
        return status.features.includes(featureId);
      },

      canAccessFeature: (requiredTier: "free" | "premium" | "pro"): boolean => {
        const { status } = get();

        if (!status.isActive && requiredTier !== "free") {
          return false;
        }

        const tierHierarchy = { free: 0, premium: 1, pro: 2 };
        const currentTierLevel = tierHierarchy[status.tier];
        const requiredTierLevel = tierHierarchy[requiredTier];

        return currentTierLevel >= requiredTierLevel;
      },
    }),
    {
      name: "subscription-store",
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
      // Persist subscription status and plans
      partialize: (state) => ({
        status: state.status,
        availablePlans: state.availablePlans,
        lastChecked: state.lastChecked,
      }),
    }
  )
);

export {};
