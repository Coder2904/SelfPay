// Mock data loading and validation utilities

import type {
  OptimizationData,
  IncomeData,
  SubscriptionStatus,
  SubscriptionPlan,
  SubscriptionFeature,
  PurchaseInfo,
} from "../types";

import {
  validateSurgeData,
  validateIncomeData,
  validateSubscriptionData,
} from "../types/validation";

// Mock data interface for subscription data
interface SubscriptionData {
  status: SubscriptionStatus;
  availablePlans: SubscriptionPlan[];
  features: SubscriptionFeature[];
  mockPurchaseInfo?: PurchaseInfo;
}

/**
 * Load and validate surge/optimization data from mock file
 */
export function loadSurgeData(mockData: unknown): OptimizationData {
  try {
    return validateSurgeData(mockData);
  } catch (error) {
    console.error("Failed to load surge data:", error);
    throw new Error(`Invalid surge data: ${error}`);
  }
}

/**
 * Load and validate income data from mock file
 */
export function loadIncomeData(mockData: unknown): IncomeData {
  try {
    return validateIncomeData(mockData);
  } catch (error) {
    console.error("Failed to load income data:", error);
    throw new Error(`Invalid income data: ${error}`);
  }
}

/**
 * Load and validate subscription data from mock file
 */
export function loadSubscriptionData(mockData: unknown): SubscriptionData {
  try {
    return validateSubscriptionData(mockData);
  } catch (error) {
    console.error("Failed to load subscription data:", error);
    throw new Error(`Invalid subscription data: ${error}`);
  }
}

/**
 * Load mock data from JSON files with error handling
 */
export async function loadMockDataFile<T>(
  filePath: string,
  validator: (data: unknown) => T
): Promise<T> {
  try {
    // In a real app, this would use require() or import()
    // For now, we'll simulate the loading process
    const mockData = require(`../../mock/${filePath}`);
    return validator(mockData);
  } catch (error) {
    console.error(`Failed to load mock data from ${filePath}:`, error);
    throw new Error(`Could not load mock data from ${filePath}: ${error}`);
  }
}

/**
 * Utility to safely load surge data from mock file
 */
export async function loadMockSurgeData(): Promise<OptimizationData> {
  return loadMockDataFile("surgeData.json", loadSurgeData);
}

/**
 * Utility to safely load income data from mock file
 */
export async function loadMockIncomeData(): Promise<IncomeData> {
  return loadMockDataFile("incomeData.json", loadIncomeData);
}

/**
 * Utility to safely load subscription data from mock file
 */
export async function loadMockSubscriptionData(): Promise<SubscriptionData> {
  return loadMockDataFile("subscriptionData.json", loadSubscriptionData);
}

/**
 * Validate all mock data files at once
 * Useful for testing and development
 */
export async function validateAllMockData(): Promise<{
  surge: OptimizationData;
  income: IncomeData;
  subscription: SubscriptionData;
}> {
  try {
    const [surge, income, subscription] = await Promise.all([
      loadMockSurgeData(),
      loadMockIncomeData(),
      loadMockSubscriptionData(),
    ]);

    return { surge, income, subscription };
  } catch (error) {
    console.error("Failed to validate all mock data:", error);
    throw error;
  }
}

/**
 * Check if mock data files exist and are valid
 * Returns validation results for each file
 */
export async function checkMockDataHealth(): Promise<{
  surge: { valid: boolean; error?: string };
  income: { valid: boolean; error?: string };
  subscription: { valid: boolean; error?: string };
}> {
  const results = {
    surge: { valid: false, error: undefined as string | undefined },
    income: { valid: false, error: undefined as string | undefined },
    subscription: { valid: false, error: undefined as string | undefined },
  };

  // Check surge data
  try {
    await loadMockSurgeData();
    results.surge.valid = true;
  } catch (error) {
    results.surge.error = String(error);
  }

  // Check income data
  try {
    await loadMockIncomeData();
    results.income.valid = true;
  } catch (error) {
    results.income.error = String(error);
  }

  // Check subscription data
  try {
    await loadMockSubscriptionData();
    results.subscription.valid = true;
  } catch (error) {
    results.subscription.error = String(error);
  }

  return results;
}

export {};
