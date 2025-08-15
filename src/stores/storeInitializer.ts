import { useAuthStore } from "./authStore";
import { useSubscriptionStore } from "./subscriptionStore";
import { useOnboardingStore } from "./onboardingStore";
import { backgroundSync } from "./queryClient";

// Store initializer utility
export class StoreInitializer {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log("Initializing stores...");

      // Initialize auth store first (other stores may depend on auth state)
      const authStore = useAuthStore.getState();
      await authStore.initialize();

      // Initialize subscription store
      const subscriptionStore = useSubscriptionStore.getState();
      await subscriptionStore.initialize();

      // Initialize onboarding store
      const onboardingStore = useOnboardingStore.getState();
      onboardingStore.initialize();

      // Enable background sync for real-time data
      backgroundSync.enableBackgroundSync();

      this.initialized = true;
      console.log("Stores initialized successfully");
    } catch (error) {
      console.error("Failed to initialize stores:", error);
      throw error;
    }
  }

  static reset(): void {
    this.initialized = false;

    // Reset all stores to initial state
    const authStore = useAuthStore.getState();
    authStore.logout();

    const subscriptionStore = useSubscriptionStore.getState();
    subscriptionStore.setStatus({
      isActive: false,
      tier: "free",
      features: [],
    });

    const onboardingStore = useOnboardingStore.getState();
    onboardingStore.resetOnboarding();

    // Disable background sync
    backgroundSync.disableBackgroundSync();
  }

  static isInitialized(): boolean {
    return this.initialized;
  }
}

// React hook for store initialization
export const useStoreInitializer = () => {
  const [isInitialized, setIsInitialized] = React.useState(
    StoreInitializer.isInitialized()
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const initialize = React.useCallback(async () => {
    if (isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);

      await StoreInitializer.initialize();
      setIsInitialized(true);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Store initialization failed");
      setError(error);
      console.error("Store initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const reset = React.useCallback(() => {
    StoreInitializer.reset();
    setIsInitialized(false);
    setError(null);
  }, []);

  React.useEffect(() => {
    if (!isInitialized && !isLoading) {
      initialize();
    }
  }, [initialize, isInitialized, isLoading]);

  return {
    isInitialized,
    isLoading,
    error,
    initialize,
    reset,
  };
};

// Import React for the hook
import React from "react";

export {};
