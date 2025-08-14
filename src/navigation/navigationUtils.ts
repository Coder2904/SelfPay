/**
 * Navigation Utilities
 * Helper functions and utilities for navigation operations
 */

import {
  createNavigationContainerRef,
  StackActions,
} from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation";

/**
 * Navigation reference for imperative navigation outside of components
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen imperatively (outside of React components)
 */
export const navigate = (name: keyof RootStackParamList, params?: any) => {
  if (navigationRef.isReady()) {
    // @ts-ignore - Navigation typing is complex, using any for now
    navigationRef.navigate(name, params);
  } else {
    console.warn("Navigation is not ready yet");
  }
};

/**
 * Go back to the previous screen
 */
export const goBack = () => {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
};

/**
 * Reset navigation stack to a specific screen
 */
export const resetToScreen = (name: keyof RootStackParamList, params?: any) => {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: name as never, params: params as never }],
    });
  }
};

/**
 * Push a new screen onto the stack
 */
export const push = (name: string, params?: any) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  }
};

/**
 * Pop screens from the stack
 */
export const pop = (count: number = 1) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.pop(count));
  }
};

/**
 * Pop to the top of the stack
 */
export const popToTop = () => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.popToTop());
  }
};

/**
 * Get current route name
 */
export const getCurrentRouteName = (): string | undefined => {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return undefined;
};

/**
 * Get current route params
 */
export const getCurrentRouteParams = (): any => {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.params;
  }
  return undefined;
};

/**
 * Check if navigation can go back
 */
export const canGoBack = (): boolean => {
  return navigationRef.isReady() && navigationRef.canGoBack();
};

/**
 * Navigation helpers for common flows
 */
export const NavigationHelpers = {
  /**
   * Navigate to login screen
   */
  goToLogin: () => {
    resetToScreen("Auth");
  },

  /**
   * Navigate to main app after successful authentication
   */
  goToApp: () => {
    resetToScreen("App");
  },

  /**
   * Navigate to onboarding flow
   */
  goToOnboarding: () => {
    resetToScreen("Onboarding");
  },

  /**
   * Navigate to paywall with source tracking
   */
  goToPaywall: (source: string, feature?: string) => {
    navigate("Paywall", { source, feature });
  },

  /**
   * Navigate to specific tab in the main app
   */
  goToTab: (_tabName: "Dashboard" | "Optimization" | "Income" | "Profile") => {
    // First ensure we're in the App navigator
    if (getCurrentRouteName() !== "App") {
      resetToScreen("App");
    }
    // Then navigate to the specific tab
    // Note: This will be handled by the tab navigator internally
    // TODO: Implement actual tab navigation when screens are implemented
  },

  /**
   * Navigate to income section with specific screen
   */
  goToIncomeScreen: (
    _screen:
      | "IncomeDashboard"
      | "AccountConnection"
      | "TransactionHistory"
      | "GoalSettings",
    _params?: any
  ) => {
    navigate("App");
    // TODO: Navigate to specific income screen
    // This will require additional navigation logic when screens are implemented
  },

  /**
   * Navigate to profile section with specific screen
   */
  goToProfileScreen: (
    _screen:
      | "ProfileHome"
      | "Settings"
      | "SubscriptionManagement"
      | "Privacy"
      | "Support",
    _params?: any
  ) => {
    navigate("App");
    // TODO: Navigate to specific profile screen
    // This will require additional navigation logic when screens are implemented
  },
};

/**
 * Navigation state utilities
 */
export const NavigationState = {
  /**
   * Get the current navigation state
   */
  getCurrentState: () => {
    if (navigationRef.isReady()) {
      return navigationRef.getRootState();
    }
    return null;
  },

  /**
   * Check if currently in auth flow
   */
  isInAuthFlow: (): boolean => {
    const routeName = getCurrentRouteName();
    return routeName === "Auth";
  },

  /**
   * Check if currently in onboarding flow
   */
  isInOnboardingFlow: (): boolean => {
    const routeName = getCurrentRouteName();
    return routeName === "Onboarding";
  },

  /**
   * Check if currently in main app
   */
  isInMainApp: (): boolean => {
    const routeName = getCurrentRouteName();
    return routeName === "App";
  },

  /**
   * Get current tab name (if in main app)
   */
  getCurrentTab: (): string | undefined => {
    if (!NavigationState.isInMainApp()) {
      return undefined;
    }
    // TODO: Implement tab detection logic
    // This will require accessing the tab navigator state
    return undefined;
  },
};

/**
 * Navigation event listeners
 */
export const NavigationEvents = {
  /**
   * Add listener for navigation state changes
   */
  addStateChangeListener: (listener: (state: any) => void) => {
    if (navigationRef.isReady()) {
      return navigationRef.addListener("state", listener);
    }
    return () => {}; // Return empty cleanup function
  },

  /**
   * Add listener for route focus events
   * TODO: Fix event listener types when implementing actual navigation
   */
  addFocusListener: (listener: () => void) => {
    if (navigationRef.isReady()) {
      // @ts-ignore - Event listener typing needs to be fixed
      return navigationRef.addListener("focus", listener);
    }
    return () => {}; // Return empty cleanup function
  },

  /**
   * Add listener for route blur events
   * TODO: Fix event listener types when implementing actual navigation
   */
  addBlurListener: (listener: () => void) => {
    if (navigationRef.isReady()) {
      // @ts-ignore - Event listener typing needs to be fixed
      return navigationRef.addListener("blur", listener);
    }
    return () => {}; // Return empty cleanup function
  },
};

/**
 * Debug utilities for navigation
 */
export const NavigationDebug = {
  /**
   * Log current navigation state
   */
  logCurrentState: () => {
    const state = NavigationState.getCurrentState();
    const routeName = getCurrentRouteName();
    const params = getCurrentRouteParams();

    console.log("Navigation Debug:", {
      currentRoute: routeName,
      params,
      canGoBack: canGoBack(),
      state,
    });
  },

  /**
   * Log navigation history
   */
  logNavigationHistory: () => {
    const state = NavigationState.getCurrentState();
    if (state) {
      console.log("Navigation History:", state);
    }
  },
};

export {};
