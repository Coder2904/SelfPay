/**
 * Optimization Feature Exports
 * Smart Optimization Engine components and services
 */

// Services
export { SurgeService, surgeService } from "./services/SurgeService";

// Components
export { SurgeHeatmap } from "./components/SurgeHeatmap";
export { RecommendationList } from "./components/RecommendationList";
export { default as EarningsOpportunityCard } from "./components/EarningsOpportunityCard";

// TODO manual implementation - Add additional exports as features are developed
// Future exports might include:
// - OptimizationScreen (main screen component)
// - OptimizationHooks (custom hooks for optimization data)
// - OptimizationStore (Zustand store for optimization state)
// - OptimizationUtils (utility functions for calculations)

export {};
