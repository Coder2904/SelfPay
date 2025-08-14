/**
 * Root Navigator
 * Main navigation container that handles authentication and onboarding flow
 */

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../types/navigation";
import { linkingConfig } from "./linkingConfig";
import { navigationRef } from "./navigationUtils";
import { useAuthGuard, useOnboardingGuard } from "./navigationGuards";

import AuthNavigator from "./AuthNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import AppNavigator from "./AppNavigator";
import PaywallScreen from "../screens/PaywallScreen";
import LoadingScreen from "../components/ui/LoadingScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const { isOnboardingComplete, isLoading: onboardingLoading } =
    useOnboardingGuard();

  // Show loading screen while checking auth/onboarding status
  if (authLoading || onboardingLoading) {
    return <LoadingScreen message="Initializing SelfPay..." />;
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linkingConfig}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {!isAuthenticated ? (
          // Auth flow
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              animationTypeForReplace: "pop",
            }}
          />
        ) : !isOnboardingComplete ? (
          // Onboarding flow
          <Stack.Screen
            name="Onboarding"
            component={OnboardingNavigator}
            options={{
              gestureEnabled: false,
            }}
          />
        ) : (
          // Main app flow
          <Stack.Screen
            name="App"
            component={AppNavigator}
            options={{
              animationTypeForReplace: "push",
            }}
          />
        )}

        {/* Global modal screens */}
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            presentation: "modal",
            headerShown: true,
            headerTitle: "Upgrade to Premium",
            headerBackTitle: "Close",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
