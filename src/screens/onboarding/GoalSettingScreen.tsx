import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FormInput } from "../../components/forms/FormInput";
import { OnboardingProgressIndicator } from "../../components/ui/OnboardingProgressIndicator";
import { useOnboarding } from "../../hooks/useOnboarding";
import type { OnboardingStackScreenProps } from "../../types/navigation";
import type { GoalSetting } from "../../types/onboarding";

type GoalSettingScreenProps = OnboardingStackScreenProps<"GoalSetting">;

export const GoalSettingScreen: React.FC<GoalSettingScreenProps> = ({
  navigation,
}) => {
  const {
    currentStep,
    totalSteps,
    completedSteps,
    updateResponse,
    nextStep,
    previousStep,
    isUpdatingResponse,
  } = useOnboarding();

  const [goalData, setGoalData] = useState<GoalSetting>({
    weeklyIncomeGoal: 0,
    monthlyIncomeGoal: 0,
    targetHoursPerWeek: 0,
    motivations: [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof GoalSetting, string>>
  >({});

  const motivationOptions = [
    "Extra income",
    "Flexible schedule",
    "Main source of income",
    "Building savings",
    "Paying off debt",
    "Fun and social interaction",
  ];

  const handleInputChange = (name: string, value: string) => {
    const field = name as keyof GoalSetting;
    const numericValue = parseFloat(value) || 0;
    setGoalData((prev) => ({ ...prev, [field]: numericValue }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleMotivationToggle = (motivation: string) => {
    setGoalData((prev) => {
      const isSelected = prev.motivations.includes(motivation);
      const newMotivations = isSelected
        ? prev.motivations.filter((m) => m !== motivation)
        : [...prev.motivations, motivation];

      return { ...prev, motivations: newMotivations };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof GoalSetting, string>> = {};

    if (!goalData.weeklyIncomeGoal || goalData.weeklyIncomeGoal <= 0) {
      newErrors.weeklyIncomeGoal = "Please enter a valid weekly income goal";
    }

    if (!goalData.monthlyIncomeGoal || goalData.monthlyIncomeGoal <= 0) {
      newErrors.monthlyIncomeGoal = "Please enter a valid monthly income goal";
    }

    if (!goalData.targetHoursPerWeek || goalData.targetHoursPerWeek <= 0) {
      newErrors.targetHoursPerWeek = "Please enter target hours per week";
    } else if (goalData.targetHoursPerWeek > 80) {
      newErrors.targetHoursPerWeek =
        "Please enter a realistic number of hours (80 or less)";
    }

    if (goalData.motivations.length === 0) {
      newErrors.motivations = "Please select at least one motivation";
    }

    // Logical validation
    if (goalData.weeklyIncomeGoal && goalData.monthlyIncomeGoal) {
      const expectedMonthly = goalData.weeklyIncomeGoal * 4.33; // Average weeks per month
      const difference = Math.abs(goalData.monthlyIncomeGoal - expectedMonthly);
      const percentDifference = (difference / expectedMonthly) * 100;

      if (percentDifference > 30) {
        newErrors.monthlyIncomeGoal =
          "Monthly goal should align with weekly goal (weekly × 4.3)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceed = (): boolean => {
    return (
      goalData.weeklyIncomeGoal > 0 &&
      goalData.monthlyIncomeGoal > 0 &&
      goalData.targetHoursPerWeek > 0 &&
      goalData.motivations.length > 0
    );
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateResponse({ step: 3, response: goalData });
      nextStep();
      navigation.navigate("PrivacyConsent");
    } catch (error) {
      console.error("Failed to save goal setting:", error);
      Alert.alert("Error", "Failed to save your goals. Please try again.");
    }
  };

  const handlePrevious = () => {
    previousStep();
    navigation.goBack();
  };

  const calculateHourlyRate = (): number => {
    if (goalData.weeklyIncomeGoal && goalData.targetHoursPerWeek) {
      return goalData.weeklyIncomeGoal / goalData.targetHoursPerWeek;
    }
    return 0;
  };

  const hourlyRate = calculateHourlyRate();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <OnboardingProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        completedSteps={completedSteps}
        stepTitles={[
          "Personal",
          "Platforms",
          "Goals",
          "Privacy",
          "Preferences",
        ]}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Set your goals
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#6B7280",
              lineHeight: 24,
            }}
          >
            Tell us about your income goals and what motivates you to work
          </Text>
        </View>

        {/* Income Goals */}
        <Card variant="elevated" style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Income Goals
          </Text>

          <FormInput
            name="weeklyIncomeGoal"
            label="Weekly Income Goal"
            placeholder="500"
            value={
              goalData.weeklyIncomeGoal > 0
                ? goalData.weeklyIncomeGoal.toString()
                : ""
            }
            onChangeText={handleInputChange}
            error={errors.weeklyIncomeGoal}
            keyboardType="numeric"
            validation={{ required: true }}
            leftIcon={<Text style={{ fontSize: 16, color: "#6B7280" }}>$</Text>}
          />

          <FormInput
            name="monthlyIncomeGoal"
            label="Monthly Income Goal"
            placeholder="2000"
            value={
              goalData.monthlyIncomeGoal > 0
                ? goalData.monthlyIncomeGoal.toString()
                : ""
            }
            onChangeText={handleInputChange}
            error={errors.monthlyIncomeGoal}
            keyboardType="numeric"
            validation={{ required: true }}
            leftIcon={<Text style={{ fontSize: 16, color: "#6B7280" }}>$</Text>}
          />

          <FormInput
            name="targetHoursPerWeek"
            label="Target Hours Per Week"
            placeholder="25"
            value={
              goalData.targetHoursPerWeek > 0
                ? goalData.targetHoursPerWeek.toString()
                : ""
            }
            onChangeText={handleInputChange}
            error={errors.targetHoursPerWeek}
            keyboardType="numeric"
            validation={{ required: true }}
          />

          {/* Hourly Rate Calculation */}
          {hourlyRate > 0 && (
            <View
              style={{
                backgroundColor: "#F0F9FF",
                padding: 12,
                borderRadius: 8,
                marginTop: 12,
              }}
            >
              <Text
                style={{ fontSize: 14, color: "#1E40AF", fontWeight: "500" }}
              >
                Target hourly rate: ${hourlyRate.toFixed(2)}/hour
              </Text>
              {hourlyRate < 10 && (
                <Text style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>
                  This is below minimum wage in most areas
                </Text>
              )}
              {hourlyRate > 40 && (
                <Text style={{ fontSize: 12, color: "#D97706", marginTop: 4 }}>
                  This is quite ambitious for gig work
                </Text>
              )}
            </View>
          )}
        </Card>

        {/* Savings Goal (Optional) */}
        <Card variant="elevated" style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Savings Goal (Optional)
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 16,
            }}
          >
            How much would you like to save each month?
          </Text>

          <FormInput
            name="savingsGoal"
            label="Monthly Savings Goal"
            placeholder="200"
            value={goalData.savingsGoal ? goalData.savingsGoal.toString() : ""}
            onChangeText={(field, value) => {
              const numericValue = parseFloat(value) || undefined;
              setGoalData((prev) => ({ ...prev, savingsGoal: numericValue }));
            }}
            keyboardType="numeric"
            leftIcon={<Text style={{ fontSize: 16, color: "#6B7280" }}>$</Text>}
          />
        </Card>

        {/* Motivations */}
        <Card variant="elevated" style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            What motivates you? *
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 16,
            }}
          >
            Select all that apply
          </Text>

          <View style={{ gap: 12 }}>
            {motivationOptions.map((motivation) => {
              const isSelected = goalData.motivations.includes(motivation);
              return (
                <TouchableOpacity
                  key={motivation}
                  onPress={() => handleMotivationToggle(motivation)}
                >
                  <Card
                    variant={isSelected ? "elevated" : "outlined"}
                    style={{
                      borderColor: isSelected ? "#3B82F6" : "#E5E7EB",
                      borderWidth: 2,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: isSelected ? "#3B82F6" : "#D1D5DB",
                          backgroundColor: isSelected
                            ? "#3B82F6"
                            : "transparent",
                          marginRight: 12,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {isSelected && (
                          <Text
                            style={{
                              color: "#FFFFFF",
                              fontSize: 12,
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </Text>
                        )}
                      </View>
                      <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                        {motivation}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>

          {errors.motivations && (
            <Text style={{ color: "#EF4444", fontSize: 14, marginTop: 8 }}>
              {errors.motivations}
            </Text>
          )}
        </Card>
      </ScrollView>

      {/* Navigation Buttons */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        }}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Button
            title="Previous"
            variant="outline"
            size="large"
            onPress={handlePrevious}
            style={{ flex: 1 }}
          />
          <Button
            title="Next"
            variant="primary"
            size="large"
            onPress={handleNext}
            isLoading={isUpdatingResponse}
            isDisabled={!canProceed()}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GoalSettingScreen;
