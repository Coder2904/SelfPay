/**
 * App Navigator
 * Main app navigation after authentication and onboarding
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { AppTabParamList } from "../types/navigation";
import TabNavigator from "./TabNavigator";

const Stack = createNativeStackNavigator<{ Main: undefined }>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
