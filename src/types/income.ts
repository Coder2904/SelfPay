// Income tracking and financial data types

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  platform: string;
  category: string;
  accountId: string;
}

export interface Account {
  id: string;
  name: string;
  type: "checking" | "savings";
  balance: number;
  platform: string;
  isConnected: boolean;
  lastSync: string;
}

export interface IncomeSummary {
  totalEarnings: number;
  weeklyGoal: number;
  goalProgress: number;
  topPlatform: string;
  weeklyEarnings?: number;
  monthlyEarnings?: number;
  averageDailyEarnings?: number;
}

export interface IncomeData {
  accounts: Account[];
  transactions: Transaction[];
  summary: IncomeSummary;
}

export interface GoalSettings {
  weeklyGoal: number;
  monthlyGoal: number;
  savingsGoal?: number;
  targetHoursPerWeek?: number;
}

export interface EarningsAnalytics {
  totalEarnings: number;
  platformBreakdown: Record<string, number>;
  weeklyTrend: number[];
  monthlyTrend: number[];
  averageHourlyRate?: number;
}

export {};
