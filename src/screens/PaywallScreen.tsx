/**
 * Paywall Screen
 * Placeholder component for subscription paywall
 * TODO: Implement actual paywall UI in subscription task
 */

import React from "react";
import { View, Text } from "react-native";
import type { RootStackScreenProps } from "../types/navigation";

type PaywallScreenProps = RootStackScreenProps<"Paywall">;

const PaywallScreen: React.FC<PaywallScreenProps> = ({ route }) => {
  const { source, feature } = route.params;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
        Upgrade to Premium
      </Text>
      <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 20 }}>
        Unlock advanced features and get the most out of SelfPay
      </Text>
      <Text style={{ fontSize: 14, color: "#666", textAlign: "center" }}>
        Source: {source}
        {feature && `\nFeature: ${feature}`}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: "#999",
          marginTop: 20,
          textAlign: "center",
        }}
      >
        TODO: Implement actual paywall UI with subscription plans
      </Text>
    </View>
  );
};

export default PaywallScreen;
