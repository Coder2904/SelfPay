// Subscription and payment types

export type SubscriptionTier = "free" | "premium" | "pro";

export interface SubscriptionStatus {
  isActive: boolean;
  tier: SubscriptionTier;
  expiresAt?: string;
  features: string[];
  autoRenew?: boolean;
  cancelledAt?: string;
  trialEndsAt?: string;
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "monthly" | "yearly";
  features: string[];
  isPopular?: boolean;
  trialDays?: number;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  tier: SubscriptionTier;
  isEnabled: boolean;
}

export interface PurchaseInfo {
  productId: string;
  transactionId: string;
  purchaseDate: string;
  expirationDate?: string;
  isTrialPeriod: boolean;
  originalTransactionId: string;
}

export interface SubscriptionState {
  status: SubscriptionStatus;
  availablePlans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  lastChecked?: string;
}

export interface PaywallConfig {
  title: string;
  subtitle: string;
  features: string[];
  plans: SubscriptionPlan[];
  showCloseButton: boolean;
  source: string;
}

export {};
