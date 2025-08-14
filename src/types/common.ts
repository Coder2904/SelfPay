// Common utility types used across the application

export interface Location {
  lat: number;
  lng: number;
  name: string;
}

export interface TimeWindow {
  start: string;
  end: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Platform {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  surgeAlerts: boolean;
  goalReminders: boolean;
  weeklyReports: boolean;
}

export interface AppConfig {
  apiBaseUrl: string;
  environment: "development" | "staging" | "production";
  version: string;
  buildNumber: string;
  useMockData: boolean;
}

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface ChartConfig {
  type: "line" | "bar" | "pie" | "area";
  data: ChartDataPoint[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
}

export type SortOrder = "asc" | "desc";

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface FilterConfig {
  field: string;
  value: any;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "between";
}

export {};
