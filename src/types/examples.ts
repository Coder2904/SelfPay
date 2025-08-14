// Example usage of types - for development reference only

import type {
  SurgeData,
  Recommendation,
  Transaction,
  Account,
  IncomeSummary,
  User,
  LoginCredentials,
  OnboardingResponses,
  SubscriptionStatus,
  SubscriptionTier,
} from "./index";

// Example type usage - these would be used in actual implementation

const exampleSurgeData: SurgeData = {
  location: {
    lat: 37.7749,
    lng: -122.4194,
    name: "Downtown SF",
  },
  multiplier: 2.5,
  platform: "uber",
  timestamp: "2025-01-14T10:00:00Z",
  duration: 3600,
};

const exampleRecommendation: Recommendation = {
  id: "rec_1",
  type: "surge",
  platform: "uber",
  title: "High Surge in Downtown",
  description: "2.5x surge multiplier active",
  estimatedEarnings: 45.5,
  confidence: 0.85,
  location: "Downtown SF",
  timeWindow: {
    start: "2025-01-14T10:00:00Z",
    end: "2025-01-14T11:00:00Z",
  },
};

const exampleTransaction: Transaction = {
  id: "txn_1",
  amount: 32.5,
  description: "Uber ride earnings",
  date: "2025-01-14T08:45:00Z",
  platform: "uber",
  category: "rideshare",
  accountId: "acc_1",
};

const exampleAccount: Account = {
  id: "acc_1",
  name: "Chase Checking",
  type: "checking",
  balance: 2450.75,
  platform: "chase",
  isConnected: true,
  lastSync: "2025-01-14T09:30:00Z",
};

const exampleIncomeSummary: IncomeSummary = {
  totalEarnings: 1250.75,
  weeklyGoal: 1500.0,
  goalProgress: 0.834,
  topPlatform: "uber",
};

const exampleUser: User = {
  id: "user_1",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  createdAt: "2025-01-14T00:00:00Z",
  updatedAt: "2025-01-14T00:00:00Z",
};

const exampleLoginCredentials: LoginCredentials = {
  email: "user@example.com",
  password: "password123",
  rememberMe: true,
};

const exampleSubscriptionStatus: SubscriptionStatus = {
  isActive: true,
  tier: "premium",
  expiresAt: "2025-02-14T00:00:00Z",
  features: ["surge_alerts", "income_analytics", "goal_tracking"],
};

// This file demonstrates that all types compile correctly
// It should not be imported in the actual application

export {};
