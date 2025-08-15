/**
 * Onboarding Navigator
 * Handles onboarding flow screens
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { OnboardingStackParamList } from "../types/navigation";

import {
  PersonalizationQuizScreen,
  PlatformSelectionScreen,
  GoalSettingScreen,
  PrivacyConsentScreen,
} from "../screens/onboarding";

// TODO: Implement these screens
const WelcomeScreen = () => null;
const OnboardingCompleteScreen = () => null;

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false, // Onboarding screens typically don't show headers
        gestureEnabled: false, // Prevent swipe back during onboarding
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          animationTypeForReplace: "pop",
        }}
      />

      <Stack.Screen
        name="PersonalizationQuiz"
        component={PersonalizationQuizScreen}
      />

      <Stack.Screen
        name="PlatformSelection"
        component={PlatformSelectionScreen}
      />

      <Stack.Screen name="GoalSetting" component={GoalSettingScreen} />

      <Stack.Screen name="PrivacyConsent" component={PrivacyConsentScreen} />

      <Stack.Screen
        name="OnboardingComplete"
        component={OnboardingCompleteScreen}
        options={{
          gestureEnabled: false, // Prevent going back from completion screen
        }}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
