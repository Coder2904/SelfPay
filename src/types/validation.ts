// Type validation utilities and guards

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
  SurgeZone,
  OptimizationData,
  IncomeData,
  SubscriptionPlan,
  SubscriptionFeature,
  PurchaseInfo,
} from "./index";

// Type guard functions for runtime validation

export function isSurgeData(data: unknown): data is SurgeData {
  return (
    typeof data === "object" &&
    data !== null &&
    "location" in data &&
    "multiplier" in data &&
    "platform" in data &&
    "timestamp" in data &&
    "duration" in data
  );
}

export function isRecommendation(data: unknown): data is Recommendation {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "type" in data &&
    "platform" in data &&
    "title" in data &&
    "description" in data &&
    "estimatedEarnings" in data &&
    "confidence" in data &&
    "timeWindow" in data
  );
}

export function isTransaction(data: unknown): data is Transaction {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "amount" in data &&
    "description" in data &&
    "date" in data &&
    "platform" in data &&
    "category" in data &&
    "accountId" in data
  );
}

export function isAccount(data: unknown): data is Account {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    "type" in data &&
    "balance" in data &&
    "platform" in data &&
    "isConnected" in data &&
    "lastSync" in data
  );
}

export function isIncomeSummary(data: unknown): data is IncomeSummary {
  return (
    typeof data === "object" &&
    data !== null &&
    "totalEarnings" in data &&
    "weeklyGoal" in data &&
    "goalProgress" in data &&
    "topPlatform" in data
  );
}

export function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "email" in data &&
    "createdAt" in data &&
    "updatedAt" in data
  );
}

export function isLoginCredentials(data: unknown): data is LoginCredentials {
  return (
    typeof data === "object" &&
    data !== null &&
    "email" in data &&
    "password" in data
  );
}

export function isSubscriptionStatus(
  data: unknown
): data is SubscriptionStatus {
  return (
    typeof data === "object" &&
    data !== null &&
    "isActive" in data &&
    "tier" in data &&
    "features" in data
  );
}

export function isSubscriptionTier(data: unknown): data is SubscriptionTier {
  return typeof data === "string" && ["free", "premium", "pro"].includes(data);
}

export function isSurgeZone(data: unknown): data is SurgeZone {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "location" in data &&
    "multiplier" in data &&
    "platform" in data &&
    "timestamp" in data &&
    "duration" in data &&
    typeof (data as any).id === "string" &&
    typeof (data as any).location === "object" &&
    typeof (data as any).multiplier === "number" &&
    typeof (data as any).platform === "string" &&
    typeof (data as any).timestamp === "string" &&
    typeof (data as any).duration === "number"
  );
}

export function isOptimizationData(data: unknown): data is OptimizationData {
  return (
    typeof data === "object" &&
    data !== null &&
    "surgeZones" in data &&
    "recommendations" in data &&
    "lastUpdated" in data &&
    Array.isArray((data as any).surgeZones) &&
    Array.isArray((data as any).recommendations) &&
    typeof (data as any).lastUpdated === "string" &&
    (data as any).surgeZones.every(isSurgeZone) &&
    (data as any).recommendations.every(isRecommendation)
  );
}

export function isIncomeData(data: unknown): data is IncomeData {
  return (
    typeof data === "object" &&
    data !== null &&
    "accounts" in data &&
    "transactions" in data &&
    "summary" in data &&
    Array.isArray((data as any).accounts) &&
    Array.isArray((data as any).transactions) &&
    typeof (data as any).summary === "object" &&
    (data as any).accounts.every(isAccount) &&
    (data as any).transactions.every(isTransaction) &&
    isIncomeSummary((data as any).summary)
  );
}

export function isSubscriptionPlan(data: unknown): data is SubscriptionPlan {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "tier" in data &&
    "name" in data &&
    "description" in data &&
    "price" in data &&
    "currency" in data &&
    "interval" in data &&
    "features" in data &&
    typeof (data as any).id === "string" &&
    isSubscriptionTier((data as any).tier) &&
    typeof (data as any).name === "string" &&
    typeof (data as any).description === "string" &&
    typeof (data as any).price === "number" &&
    typeof (data as any).currency === "string" &&
    ["monthly", "yearly"].includes((data as any).interval) &&
    Array.isArray((data as any).features) &&
    (data as any).features.every((f: unknown) => typeof f === "string")
  );
}

export function isSubscriptionFeature(
  data: unknown
): data is SubscriptionFeature {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    "description" in data &&
    "tier" in data &&
    "isEnabled" in data &&
    typeof (data as any).id === "string" &&
    typeof (data as any).name === "string" &&
    typeof (data as any).description === "string" &&
    isSubscriptionTier((data as any).tier) &&
    typeof (data as any).isEnabled === "boolean"
  );
}

export function isPurchaseInfo(data: unknown): data is PurchaseInfo {
  return (
    typeof data === "object" &&
    data !== null &&
    "productId" in data &&
    "transactionId" in data &&
    "purchaseDate" in data &&
    "isTrialPeriod" in data &&
    "originalTransactionId" in data &&
    typeof (data as any).productId === "string" &&
    typeof (data as any).transactionId === "string" &&
    typeof (data as any).purchaseDate === "string" &&
    typeof (data as any).isTrialPeriod === "boolean" &&
    typeof (data as any).originalTransactionId === "string"
  );
}

// Enhanced validation functions for mock data files
export function validateSurgeData(data: unknown): OptimizationData {
  if (!isOptimizationData(data)) {
    throw new Error(
      "Invalid surge data structure: Expected OptimizationData with surgeZones, recommendations, and lastUpdated"
    );
  }
  return data;
}

export function validateIncomeData(data: unknown): IncomeData {
  if (!isIncomeData(data)) {
    throw new Error(
      "Invalid income data structure: Expected IncomeData with accounts, transactions, and summary"
    );
  }
  return data;
}

export function validateSubscriptionData(data: unknown): {
  status: SubscriptionStatus;
  availablePlans: SubscriptionPlan[];
  features: SubscriptionFeature[];
  mockPurchaseInfo?: PurchaseInfo;
} {
  if (
    typeof data !== "object" ||
    data === null ||
    !("status" in data) ||
    !("availablePlans" in data) ||
    !("features" in data)
  ) {
    throw new Error(
      "Invalid subscription data structure: Expected status, availablePlans, and features"
    );
  }

  const typedData = data as any;

  if (!isSubscriptionStatus(typedData.status)) {
    throw new Error("Invalid subscription status structure");
  }

  if (
    !Array.isArray(typedData.availablePlans) ||
    !typedData.availablePlans.every(isSubscriptionPlan)
  ) {
    throw new Error("Invalid subscription plans structure");
  }

  if (
    !Array.isArray(typedData.features) ||
    !typedData.features.every(isSubscriptionFeature)
  ) {
    throw new Error("Invalid subscription features structure");
  }

  if (
    typedData.mockPurchaseInfo &&
    !isPurchaseInfo(typedData.mockPurchaseInfo)
  ) {
    throw new Error("Invalid mock purchase info structure");
  }

  return typedData;
}

// Generic validation function
export function validateMockData<T>(
  data: unknown,
  validator: (data: unknown) => data is T
): T {
  if (!validator(data)) {
    throw new Error("Invalid mock data structure");
  }
  return data;
}

// Utility function to create mock data validators
// Note: This is a placeholder for the intended usage pattern
// Actual implementation should be done in service files with proper module resolution
export function createMockDataValidator<T>(
  validator: (data: unknown) => T
): (data: unknown) => T {
  return (data: unknown) => {
    try {
      return validator(data);
    } catch (error) {
      throw new Error(`Failed to validate mock data: ${error}`);
    }
  };
}

export {};
