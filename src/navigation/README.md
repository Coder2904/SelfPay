# Navigation Architecture

This directory contains the complete navigation setup for SelfPay, implementing a hierarchical navigation structure with authentication and subscription guards.

## Structure

### Core Navigators

- **RootNavigator**: Main navigation container that handles the top-level flow
- **AuthNavigator**: Manages authentication screens (Login, Signup, etc.)
- **OnboardingNavigator**: Handles the onboarding flow for new users
- **AppNavigator**: Main app navigation wrapper
- **TabNavigator**: Bottom tab navigation for the main app features

### Navigation Flow

```
RootNavigator
├── AuthNavigator (when not authenticated)
│   ├── Login
│   ├── Signup
│   ├── ForgotPassword
│   └── BiometricSetup
├── OnboardingNavigator (when authenticated but onboarding incomplete)
│   ├── Welcome
│   ├── PersonalizationQuiz
│   ├── PlatformSelection
│   ├── GoalSetting
│   ├── PrivacyConsent
│   └── OnboardingComplete
├── AppNavigator (when authenticated and onboarding complete)
│   └── TabNavigator
│       ├── Dashboard
│       ├── Optimization
│       ├── Income (Stack Navigator)
│       │   ├── IncomeDashboard
│       │   ├── AccountConnection
│       │   ├── TransactionHistory
│       │   └── GoalSettings
│       └── Profile (Stack Navigator)
│           ├── ProfileHome
│           ├── Settings
│           ├── SubscriptionManagement
│           ├── Privacy
│           └── Support
└── Paywall (Global Modal)
```

## Navigation Guards

### Authentication Guard (`useAuthGuard`)

- Checks if user is authenticated
- Returns loading state while checking
- Currently uses mock data (USE_MOCK_DATA flag)

### Onboarding Guard (`useOnboardingGuard`)

- Checks if user has completed onboarding
- Tracks current onboarding step
- Currently uses mock data (USE_MOCK_DATA flag)

### Subscription Guard (`useSubscriptionGuard`)

- Checks subscription status and tier
- Provides feature access checking
- Includes HOC for protecting premium features

## Deep Linking

### Configuration

- Supports custom scheme: `selfpay://`
- Web URLs: `https://selfpay.app` and `https://www.selfpay.app`
- Comprehensive URL mapping for all screens

### Common Deep Links

- `selfpay://login` - Login screen
- `selfpay://dashboard` - Main dashboard
- `selfpay://optimize` - Optimization screen
- `selfpay://income` - Income tracking
- `selfpay://upgrade?feature=advanced` - Paywall with feature context

## Navigation Utilities

### Imperative Navigation

```typescript
import { navigate, goBack, resetToScreen } from "../navigation/navigationUtils";

// Navigate to a screen
navigate("App");

// Go back
goBack();

// Reset navigation stack
resetToScreen("Auth");
```

### Navigation Helpers

```typescript
import { NavigationHelpers } from "../navigation/navigationUtils";

// Common navigation actions
NavigationHelpers.goToLogin();
NavigationHelpers.goToApp();
NavigationHelpers.goToPaywall("optimization", "advanced_features");
```

## Implementation Status

### ✅ Completed

- Navigation structure and hierarchy
- TypeScript types for all navigators
- Deep linking configuration
- Navigation guards (mock implementation)
- Navigation utilities and helpers
- Loading states and error handling

### 🚧 TODO (Future Tasks)

- Implement actual screen components
- Connect to real authentication service
- Connect to real subscription service
- Add proper tab bar icons
- Implement screen-specific navigation logic
- Add navigation analytics
- Add navigation accessibility features

## Usage Notes

1. **Mock Data**: Currently uses mock data for authentication and subscription checks
2. **Screen Placeholders**: All screen components are placeholders returning null
3. **TypeScript**: Full type safety with React Navigation v6
4. **Accessibility**: Basic accessibility support, can be enhanced
5. **Performance**: Lazy loading ready for screen components

## Testing

The navigation setup includes:

- TypeScript compilation validation
- Navigation guard hooks
- Deep link parsing utilities
- Navigation state management

Run `npx tsc --noEmit` to verify TypeScript compilation.
