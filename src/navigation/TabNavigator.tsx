/**
 * Tab Navigator
 * Bottom tab navigation for main app screens
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type {
  AppTabParamList,
  IncomeStackParamList,
  ProfileStackParamList,
} from "../types/navigation";

// TODO: Import actual screen components when they're implemented
// For now, using placeholder components
const DashboardScreen = () => null;
const OptimizationScreen = () => null;

// Income Stack screens
const IncomeDashboardScreen = () => null;
const AccountConnectionScreen = () => null;
const TransactionHistoryScreen = () => null;
const GoalSettingsScreen = () => null;

// Profile Stack screens
const ProfileHomeScreen = () => null;
const SettingsScreen = () => null;
const SubscriptionManagementScreen = () => null;
const PrivacyScreen = () => null;
const SupportScreen = () => null;

const Tab = createBottomTabNavigator<AppTabParamList>();
const IncomeStack = createNativeStackNavigator<IncomeStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Income Stack Navigator
const IncomeNavigator: React.FC = () => {
  return (
    <IncomeStack.Navigator
      initialRouteName="IncomeDashboard"
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
        headerTintColor: "#000",
        headerStyle: {
          backgroundColor: "#fff",
        },
      }}
    >
      <IncomeStack.Screen
        name="IncomeDashboard"
        component={IncomeDashboardScreen}
        options={{
          headerTitle: "Income Tracking",
          headerShown: false, // Tab screen, header handled by tab navigator
        }}
      />

      <IncomeStack.Screen
        name="AccountConnection"
        component={AccountConnectionScreen}
        options={{
          headerTitle: "Connect Account",
          headerBackTitle: "Back",
        }}
      />

      <IncomeStack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
        options={{
          headerTitle: "Transaction History",
          headerBackTitle: "Back",
        }}
      />

      <IncomeStack.Screen
        name="GoalSettings"
        component={GoalSettingsScreen}
        options={{
          headerTitle: "Income Goals",
          headerBackTitle: "Back",
        }}
      />
    </IncomeStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      initialRouteName="ProfileHome"
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
        headerTintColor: "#000",
        headerStyle: {
          backgroundColor: "#fff",
        },
      }}
    >
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileHomeScreen}
        options={{
          headerTitle: "Profile",
          headerShown: false, // Tab screen, header handled by tab navigator
        }}
      />

      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
          headerBackTitle: "Back",
        }}
      />

      <ProfileStack.Screen
        name="SubscriptionManagement"
        component={SubscriptionManagementScreen}
        options={{
          headerTitle: "Subscription",
          headerBackTitle: "Back",
        }}
      />

      <ProfileStack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          headerTitle: "Privacy",
          headerBackTitle: "Back",
        }}
      />

      <ProfileStack.Screen
        name="Support"
        component={SupportScreen}
        options={{
          headerTitle: "Support",
          headerBackTitle: "Back",
        }}
      />
    </ProfileStack.Navigator>
  );
};

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#000",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e5e5e5",
          borderTopWidth: 1,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: "Dashboard",
          tabBarLabel: "Home",
          // TODO: Add proper tab bar icon
          tabBarIcon: () => null,
        }}
      />

      <Tab.Screen
        name="Optimization"
        component={OptimizationScreen}
        options={{
          headerTitle: "Smart Optimization",
          tabBarLabel: "Optimize",
          // TODO: Add proper tab bar icon
          tabBarIcon: () => null,
        }}
      />

      <Tab.Screen
        name="Income"
        component={IncomeNavigator}
        options={{
          headerShown: false, // Handled by stack navigator
          tabBarLabel: "Income",
          // TODO: Add proper tab bar icon
          tabBarIcon: () => null,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          headerShown: false, // Handled by stack navigator
          tabBarLabel: "Profile",
          // TODO: Add proper tab bar icon
          tabBarIcon: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
