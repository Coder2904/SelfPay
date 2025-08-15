import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

// Error handling for queries
const handleQueryError = (error: unknown) => {
  console.error("Query error:", error);

  // TODO: Add error reporting service integration
  // TODO: Add user-friendly error notifications
};

// Error handling for mutations
const handleMutationError = (error: unknown) => {
  console.error("Mutation error:", error);

  // TODO: Add error reporting service integration
  // TODO: Add user-friendly error notifications
};

// Create React Query client with custom configuration
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleQueryError,
  }),
  mutationCache: new MutationCache({
    onError: handleMutationError,
  }),
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Cache time - how long data stays in cache after becoming unused
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }

        // Retry up to 3 times for other errors
        return failureCount < 3;
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus (useful for web, less so for mobile)
      refetchOnWindowFocus: false,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry configuration for mutations
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }

        // Retry once for network errors
        return failureCount < 1;
      },

      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Authentication
  auth: {
    user: ["auth", "user"] as const,
    session: ["auth", "session"] as const,
    biometric: ["auth", "biometric"] as const,
    status: ["auth", "status"] as const,
  },

  // Subscription
  subscription: {
    status: ["subscription", "status"] as const,
    plans: ["subscription", "plans"] as const,
    features: ["subscription", "features"] as const,
  },

  // Surge data
  surge: {
    all: ["surge"] as const,
    data: (location?: string) => ["surge", "data", location] as const,
    recommendations: (platform?: string) =>
      ["surge", "recommendations", platform] as const,
  },

  // Income data
  income: {
    all: ["income"] as const,
    transactions: (
      accountId?: string,
      dateRange?: { start: string; end: string }
    ) => ["income", "transactions", accountId, dateRange] as const,
    accounts: ["income", "accounts"] as const,
    summary: (period?: string) => ["income", "summary", period] as const,
    analytics: (timeframe?: string) =>
      ["income", "analytics", timeframe] as const,
  },

  // Bank linking
  banking: {
    accounts: ["banking", "accounts"] as const,
    linkToken: ["banking", "linkToken"] as const,
    institutions: ["banking", "institutions"] as const,
  },

  // Onboarding
  onboarding: {
    progress: ["onboarding", "progress"] as const,
    steps: ["onboarding", "steps"] as const,
  },
} as const;

// Utility functions for cache management
export const cacheUtils = {
  // Invalidate all queries for a specific feature
  invalidateFeature: async (feature: keyof typeof queryKeys) => {
    await queryClient.invalidateQueries({
      queryKey: [feature],
    });
  },

  // Clear all cached data
  clearAll: () => {
    queryClient.clear();
  },

  // Remove specific query from cache
  removeQuery: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey });
  },

  // Set query data manually
  setQueryData: <T>(queryKey: readonly unknown[], data: T) => {
    queryClient.setQueryData(queryKey, data);
  },

  // Get cached query data
  getQueryData: <T>(queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  },

  // Prefetch query
  prefetchQuery: async (
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
    });
  },
};

// Background sync configuration
export const backgroundSync = {
  // Enable background sync for critical data
  enableBackgroundSync: () => {
    // Sync user data every 5 minutes
    setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.user,
      });
    }, 5 * 60 * 1000);

    // Sync subscription status every 10 minutes
    setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.status,
      });
    }, 10 * 60 * 1000);

    // Sync surge data every 2 minutes (more frequent for real-time data)
    setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.surge.all,
      });
    }, 2 * 60 * 1000);
  },

  // Disable background sync
  disableBackgroundSync: () => {
    // TODO: Implement interval cleanup
    console.log("Background sync disabled");
  },
};

export {};
