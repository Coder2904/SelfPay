/**
 * Auth Navigator
 * Handles authentication flow screens
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { AuthStackParamList } from "../types/navigation";
import {
  LoginScreen,
  SignupScreen,
  BiometricSetupScreen,
  ForgotPasswordScreen,
} from "../screens/auth";

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
        headerTintColor: "#000",
        headerStyle: {
          backgroundColor: "#fff",
        },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerTitle: "Welcome Back",
          headerShown: false, // Login typically doesn't show header
        }}
      />

      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          headerTitle: "Create Account",
          headerShown: false, // Signup typically doesn't show header
        }}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerTitle: "Reset Password",
          headerBackTitle: "Back",
        }}
      />

      <Stack.Screen
        name="BiometricSetup"
        component={BiometricSetupScreen}
        options={{
          headerTitle: "Biometric Setup",
          headerBackTitle: "Back",
          gestureEnabled: false, // Prevent swipe back during setup
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
