import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { OnboardingProgressIndicator } from "../../components/ui/OnboardingProgressIndicator";
import { useOnboarding } from "../../hooks/useOnboarding";
import { onboardingService } from "../../services/OnboardingService";
import type { OnboardingStackScreenProps } from "../../types/navigation";
import type { PlatformSelection } from "../../types/onboarding";

type PlatformSelectionScreenProps =
  OnboardingStackScreenProps<"PlatformSelection">;

export const PlatformSelectionScreen: React.FC<
  PlatformSelectionScreenProps
> = ({ navigation }) => {
  const {
    currentStep,
    totalSteps,
    completedSteps,
    updateResponse,
    nextStep,
    previousStep,
    isUpdatingResponse,
  } = useOnboarding();

  const [platformData, setPlatformData] = useState<PlatformSelection>({
    selectedPlatforms: [],
    primaryPlatform: "",
    experienceLevel: "beginner",
  });

  const platforms = onboardingService.getAvailablePlatforms();
  const experienceLevels = [
    {
      value: "beginner",
      label: "Just starting out",
      description: "New to gig work",
    },
    {
      value: "intermediate",
      label: "Some experience",
      description: "1-2 years of gig work",
    },
    {
      value: "expert",
      label: "Very experienced",
      description: "3+ years of gig work",
    },
  ];

  const handlePlatformToggle = (platformId: string) => {
    setPlatformData((prev) => {
      const isSelected = prev.selectedPlatforms.includes(platformId);
      const newSelectedPlatforms = isSelected
        ? prev.selectedPlatforms.filter((id) => id !== platformId)
        : [...prev.selectedPlatforms, platformId];

      // If deselecting the primary platform, clear it
      const newPrimaryPlatform =
        isSelected && prev.primaryPlatform === platformId
          ? ""
          : prev.primaryPlatform;

      return {
        ...prev,
        selectedPlatforms: newSelectedPlatforms,
        primaryPlatform: newPrimaryPlatform,
      };
    });
  };

  const handlePrimaryPlatformSelect = (platformId: string) => {
    setPlatformData((prev) => ({
      ...prev,
      primaryPlatform: platformId,
    }));
  };

  const handleExperienceLevelSelect = (
    level: "beginner" | "intermediate" | "expert"
  ) => {
    setPlatformData((prev) => ({
      ...prev,
      experienceLevel: level,
    }));
  };

  const canProceed = (): boolean => {
    return (
      platformData.selectedPlatforms.length > 0 &&
      platformData.primaryPlatform !== "" &&
      platformData.selectedPlatforms.includes(platformData.primaryPlatform)
    );
  };

  const handleNext = async () => {
    if (!canProceed()) {
      Alert.alert(
        "Required Information",
        "Please select at least one platform and choose a primary platform."
      );
      return;
    }

    try {
      await updateResponse({ step: 2, response: platformData });
      nextStep();
      navigation.navigate("GoalSetting");
    } catch (error) {
      console.error("Failed to save platform selection:", error);
      Alert.alert(
        "Error",
        "Failed to save your platform selection. Please try again."
      );
    }
  };

  const handlePrevious = () => {
    previousStep();
    navigation.goBack();
  };

  const getPlatformsByCategory = () => {
    const categories: Record<string, typeof platforms> = {};
    platforms.forEach((platform) => {
      if (!categories[platform.category]) {
        categories[platform.category] = [];
      }
      categories[platform.category].push(platform);
    });
    return categories;
  };

  const platformsByCategory = getPlatformsByCategory();

  const renderPlatformCard = (platform: any) => {
    const isSelected = platformData.selectedPlatforms.includes(platform.id);
    const isPrimary = platformData.primaryPlatform === platform.id;

    return (
      <TouchableOpacity
        key={platform.id}
        onPress={() => handlePlatformToggle(platform.id)}
      >
        <Card
          variant={isSelected ? "elevated" : "outlined"}
          style={{
            borderColor: isSelected ? "#3B82F6" : "#E5E7EB",
            borderWidth: 2,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: isSelected ? "#3B82F6" : "#D1D5DB",
                backgroundColor: isSelected ? "#3B82F6" : "transparent",
                marginRight: 16,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isSelected && (
                <Text
                  style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}
                >
                  ✓
                </Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}
                >
                  {platform.name}
                </Text>
                {isPrimary && (
                  <View
                    style={{
                      backgroundColor: "#10B981",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 12,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      PRIMARY
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>
                {platform.description}
              </Text>
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: "#059669" }}
              >
                {platform.estimatedHourlyRange}/hour
              </Text>
            </View>

            {isSelected && (
              <TouchableOpacity
                onPress={() => handlePrimaryPlatformSelect(platform.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor: isPrimary ? "#10B981" : "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: isPrimary ? "#FFFFFF" : "#6B7280",
                  }}
                >
                  {isPrimary ? "Primary" : "Set Primary"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

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
            Choose your platforms
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#6B7280",
              lineHeight: 24,
            }}
          >
            Select the gig work platforms you use or want to use. Choose one as
            your primary platform.
          </Text>
        </View>

        {/* Experience Level */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Experience Level
          </Text>
          <View style={{ gap: 12 }}>
            {experienceLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                onPress={() => handleExperienceLevelSelect(level.value as any)}
              >
                <Card
                  variant={
                    platformData.experienceLevel === level.value
                      ? "elevated"
                      : "outlined"
                  }
                  style={{
                    borderColor:
                      platformData.experienceLevel === level.value
                        ? "#3B82F6"
                        : "#E5E7EB",
                    borderWidth: 2,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor:
                          platformData.experienceLevel === level.value
                            ? "#3B82F6"
                            : "#D1D5DB",
                        backgroundColor:
                          platformData.experienceLevel === level.value
                            ? "#3B82F6"
                            : "transparent",
                        marginRight: 12,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {platformData.experienceLevel === level.value && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#FFFFFF",
                          }}
                        />
                      )}
                    </View>
                    <View>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {level.label}
                      </Text>
                      <Text style={{ fontSize: 14, color: "#6B7280" }}>
                        {level.description}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Platforms by Category */}
        {Object.entries(platformsByCategory).map(
          ([category, categoryPlatforms]) => (
            <View key={category} style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 16,
                  textTransform: "capitalize",
                }}
              >
                {category} Platforms
              </Text>
              {categoryPlatforms.map(renderPlatformCard)}
            </View>
          )
        )}

        {/* Selection Summary */}
        {platformData.selectedPlatforms.length > 0 && (
          <Card
            variant="elevated"
            style={{ backgroundColor: "#F0F9FF", marginBottom: 20 }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Selected Platforms ({platformData.selectedPlatforms.length})
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              Primary:{" "}
              {platforms.find((p) => p.id === platformData.primaryPlatform)
                ?.name || "None selected"}
            </Text>
          </Card>
        )}
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

export default PlatformSelectionScreen;
