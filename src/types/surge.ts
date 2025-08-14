// Surge pricing and optimization types

export interface SurgeData {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  multiplier: number;
  platform: string;
  timestamp: string;
  duration: number;
}

export interface Recommendation {
  id: string;
  type: "surge" | "demand" | "bonus";
  platform: string;
  title: string;
  description: string;
  estimatedEarnings: number;
  confidence: number;
  location?: string;
  timeWindow: {
    start: string;
    end: string;
  };
}

export interface SurgeZone {
  id: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  multiplier: number;
  platform: string;
  timestamp: string;
  duration: number;
}

export interface OptimizationData {
  surgeZones: SurgeZone[];
  recommendations: Recommendation[];
  lastUpdated: string;
}

export {};
