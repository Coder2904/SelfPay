# Zustand Stores and React Query Configuration

This directory contains the global state management setup for the SelfPay app using Zustand for client state and React Query for server state management.

## Overview

### Stores

1. **AuthStore** (`authStore.ts`) - Manages authentication state and user data
2. **SubscriptionStore** (`subscriptionStore.ts`) - Handles subscription status and feature access
3. **OnboardingStore** (`onboardingStore.ts`) - Tracks onboarding progress and responses

### React Query Configuration

- **QueryClient** (`queryClient.ts`) - Configured with caching strategies and error handling
- **QueryProvider** (`QueryProvider.tsx`) - React component to wrap the app
- **Query Keys** - Centralized query key management for consistency

### Custom Hooks

Located in `src/hooks/`:

- **useAuth** - Combines auth store with React Query for authentication
- **useSubscription** - Manages subscription state with server sync
- **useOnboarding** - Handles onboarding flow with persistence

## Usage

### Setting up the App

```tsx
import React from "react";
import { QueryProvider, useStoreInitializer } from "./stores";

function App() {
  const { isInitialized, isLoading, error } = useStoreInitializer();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <QueryProvider>
      <AppNavigator />
    </QueryProvider>
  );
}
```

### Using Auth Store

```tsx
import { useAuth } from "../hooks";

function LoginScreen() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // Navigate to main app
    } catch (error) {
      // Handle error
    }
  };

  return <View>{/* Login form */}</View>;
}
```

### Using Subscription Store

```tsx
import { useSubscription } from "../hooks";

function PaywallScreen() {
  const { availablePlans, purchase, canAccessFeature, isPurchaseLoading } =
    useSubscription();

  const handlePurchase = async (productId) => {
    try {
      await purchase(productId);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <View>
      {availablePlans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onPurchase={() => handlePurchase(plan.id)}
          loading={isPurchaseLoading}
        />
      ))}
    </View>
  );
}
```

### Using Onboarding Store

```tsx
import { useOnboarding } from "../hooks";

function OnboardingScreen() {
  const {
    currentStep,
    totalSteps,
    progress,
    nextStep,
    updateResponse,
    completeOnboarding,
  } = useOnboarding();

  const handleStepComplete = async (response) => {
    try {
      await updateResponse(currentStep, response);

      if (currentStep === totalSteps) {
        await completeOnboarding();
        // Navigate to main app
      } else {
        nextStep();
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <View>
      <ProgressBar progress={progress} />
      <OnboardingStep step={currentStep} onComplete={handleStepComplete} />
    </View>
  );
}
```

## Features

### Persistence

- Auth state persists user data (non-sensitive)
- Subscription status persists across app restarts
- Onboarding progress is saved and can be resumed

### Security

- Sensitive tokens are stored in secure storage
- Only non-sensitive data is persisted in regular storage
- Automatic token refresh handling

### Error Handling

- Global error boundaries for React Query
- Retry logic with exponential backoff
- User-friendly error messages

### Caching

- Intelligent cache invalidation
- Background sync for real-time data
- Optimistic updates for better UX

### Mock Data Support

- All stores work with mock data during development
- Easy switching between mock and real APIs
- Consistent interfaces regardless of data source

## Configuration

### Environment Variables

The stores respect the `USE_MOCK_DATA` constant for switching between mock and real data sources.

### Cache Configuration

React Query is configured with:

- 5-minute stale time for most queries
- 10-minute garbage collection time
- Automatic retry with exponential backoff
- Background refetch on reconnect

### Background Sync

Automatic background sync is enabled for:

- User data (every 5 minutes)
- Subscription status (every 10 minutes)
- Surge data (every 2 minutes)

## Testing

All stores include placeholder test files in `__tests__/` directories. The stores are designed to be easily testable with:

- Mock implementations for external services
- Predictable state transitions
- Clear separation of concerns

## TODO Items

- [ ] Implement RevenueCat integration for subscription store
- [ ] Add error reporting service integration
- [ ] Implement user-friendly error notifications
- [ ] Add offline mode support
- [ ] Implement background sync interval cleanup
- [ ] Add performance monitoring for store operations
