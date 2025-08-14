# Requirements Document

## Introduction

SelfPay is a comprehensive income optimization and financial management app for gig workers and multi-platform earners. Week 1 focuses on establishing the foundational architecture with three core features: a Smart Optimization Engine shell, Multi-platform Income Tracking foundation, and RevenueCat Subscription system. The implementation prioritizes creating a working scaffold with mock data, proper TypeScript interfaces, and a complete navigation structure that can be built upon in subsequent weeks.

## Requirements

### Requirement 1: Project Foundation and Infrastructure

**User Story:** As a developer, I want a properly configured React Native Expo project with TypeScript, so that I can build upon a solid foundation with all necessary dependencies and folder structure.

#### Acceptance Criteria

1. WHEN the project is initialized THEN the system SHALL create an Expo project with TypeScript configuration
2. WHEN dependencies are installed THEN the system SHALL include Zustand, React Query, NativeWind, React Navigation, RevenueCat, and Plaid
3. WHEN the folder structure is created THEN the system SHALL organize code into src/components/, src/screens/, src/services/, src/hooks/, src/utils/, src/types/, src/navigation/, and src/features/ directories
4. WHEN constants are defined THEN the system SHALL include a USE_MOCK_DATA flag for toggling between mock and real data
5. WHEN environment configuration is set up THEN the system SHALL create .env.example with placeholders for PLAID_CLIENT_ID, PLAID_SECRET, REVENUECAT_API_KEY, SUPABASE_URL, and SUPABASE_ANON_KEY

### Requirement 2: Mock Data System and Type Safety

**User Story:** As a developer, I want a comprehensive mock data system with TypeScript interfaces, so that I can develop and test features without depending on external APIs.

#### Acceptance Criteria

1. WHEN mock data is created THEN the system SHALL generate JSON files in /mock/ directory for surgeData, recommendations, and incomeData
2. WHEN TypeScript interfaces are defined THEN the system SHALL create types for SurgeData, Recommendation, Transaction, Account, IncomeSummary, and subscription-related data
3. WHEN data validation is implemented THEN the system SHALL include type guards and validation utilities for all mock data
4. WHEN mock data is accessed THEN the system SHALL validate data shape against TypeScript types

### Requirement 3: Smart Optimization Engine Shell

**User Story:** As a gig worker, I want to see surge pricing information and earning recommendations, so that I can optimize my income opportunities.

#### Acceptance Criteria

1. WHEN the optimization feature is scaffolded THEN the system SHALL create src/features/optimization/ directory structure
2. WHEN OptimizationScreen is created THEN the system SHALL display SurgeHeatmap, RecommendationList, and EarningsOpportunityCard components with mock data
3. WHEN surgeService is implemented THEN the system SHALL provide getSurgeData() function returning mock/surgeData.json
4. WHEN optimization algorithms are referenced THEN the system SHALL mark incomplete logic with "// TODO manual implementation" comments
5. WHEN the screen is accessed THEN the system SHALL render without errors using mock data

### Requirement 4: Multi-Platform Income Tracking Foundation

**User Story:** As a multi-platform earner, I want to connect my bank accounts and view my income dashboard, so that I can track my earnings across different platforms.

#### Acceptance Criteria

1. WHEN income tracking is scaffolded THEN the system SHALL create src/features/income/ directory structure
2. WHEN bank linking service is created THEN the system SHALL provide Plaid sandbox connection stubs with token exchange functionality
3. WHEN income service is implemented THEN the system SHALL fetch mock transactions from mock/incomeData.json
4. WHEN IncomeDashboard is created THEN the system SHALL display static charts, linked accounts, and goal progress bars
5. WHEN account connection is attempted THEN the system SHALL show AccountConnectionButton and handle connection flow with mock responses

### Requirement 5: RevenueCat Subscription System

**User Story:** As a user, I want to subscribe to premium features and manage my subscription, so that I can access advanced functionality.

#### Acceptance Criteria

1. WHEN subscription system is scaffolded THEN the system SHALL create src/features/subscriptions/ directory structure
2. WHEN subscription service is created THEN the system SHALL provide RevenueCat sandbox integration with stub functions
3. WHEN subscription status is checked THEN the system SHALL use useSubscriptionStatus hook with mock subscription state
4. WHEN paywall is displayed THEN the system SHALL show PaywallScreen with static tier and pricing information
5. WHEN feature gating is implemented THEN the system SHALL provide FeatureGate HOC for restricting access to premium features

### Requirement 6: Navigation and Authentication

**User Story:** As a user, I want secure authentication and intuitive navigation, so that I can access the app features safely and efficiently.

#### Acceptance Criteria

1. WHEN navigation is configured THEN the system SHALL implement AuthNavigator, AppNavigator, and bottom tab navigation
2. WHEN deep linking is set up THEN the system SHALL handle deep link routing to appropriate screens
3. WHEN authentication service is created THEN the system SHALL provide Supabase Auth integration with mock switching logic
4. WHEN auth screens are implemented THEN the system SHALL include login, signup, and biometric authentication options
5. WHEN token management is implemented THEN the system SHALL handle token refresh and secure storage

### Requirement 7: Onboarding and User Experience

**User Story:** As a new user, I want a guided onboarding experience, so that I can set up my preferences and understand how to use the app.

#### Acceptance Criteria

1. WHEN onboarding service is created THEN the system SHALL provide personalization quiz, platform selection, goal setting, and privacy consent tracking
2. WHEN onboarding screens are implemented THEN the system SHALL show progress tracking and step-by-step guidance
3. WHEN user preferences are collected THEN the system SHALL persist settings for future app sessions
4. WHEN onboarding is completed THEN the system SHALL navigate user to main dashboard

### Requirement 8: Dashboard and Global Systems

**User Story:** As a user, I want a central dashboard with global error handling, so that I can access all features and receive helpful feedback when issues occur.

#### Acceptance Criteria

1. WHEN dashboard is created THEN the system SHALL provide shell with placeholder sections for Week 2-4 features
2. WHEN global error handling is implemented THEN the system SHALL display friendly error messages and handle offline scenarios
3. WHEN UI components are created THEN the system SHALL provide reusable styled components with NativeWind
4. WHEN loading states are implemented THEN the system SHALL show appropriate loading indicators and chart placeholders

### Requirement 9: State Management and Data Flow

**User Story:** As a developer, I want proper state management and data caching, so that the app performs well and maintains consistent state.

#### Acceptance Criteria

1. WHEN Zustand store is implemented THEN the system SHALL manage authentication state and user preferences
2. WHEN React Query is configured THEN the system SHALL handle API caching and background updates
3. WHEN state hydration is implemented THEN the system SHALL restore user state on app launch
4. WHEN subscription state is managed THEN the system SHALL track subscription status and feature access

### Requirement 10: Testing and Quality Assurance

**User Story:** As a developer, I want comprehensive testing setup and quality checks, so that the code is maintainable and reliable.

#### Acceptance Criteria

1. WHEN testing framework is set up THEN the system SHALL configure Jest and React Native Testing Library
2. WHEN test files are created THEN the system SHALL include placeholder test files with .skip describe blocks for all services and components
3. WHEN mock data validation is tested THEN the system SHALL verify mock data shape against TypeScript types
4. WHEN the app is built THEN the system SHALL compile and run without errors using expo start
5. WHEN code quality is checked THEN the system SHALL ensure all incomplete logic is marked with "// TODO manual implementation" and files include "export {}" to prevent unused import errors
