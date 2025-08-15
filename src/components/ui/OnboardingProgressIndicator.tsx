import React from "react";
import { View, Text, ViewStyle, TextStyle } from "react-native";
import { ProgressBar } from "../charts/ProgressBar";

export interface OnboardingProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  stepTitles?: string[];
  showStepNumbers?: boolean;
  showProgressBar?: boolean;
  style?: ViewStyle;
}

export const OnboardingProgressIndicator: React.FC<
  OnboardingProgressIndicatorProps
> = ({
  currentStep,
  totalSteps,
  completedSteps,
  stepTitles = [],
  showStepNumbers = true,
  showProgressBar = true,
  style,
}) => {
  const progress = completedSteps.length / totalSteps;
  const progressPercentage = Math.round(progress * 100);

  const getContainerStyles = (): ViewStyle => ({
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    ...style,
  });

  const getHeaderStyles = (): ViewStyle => ({
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: showProgressBar ? 12 : 0,
  });

  const getStepTextStyles = (): TextStyle => ({
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  });

  const getProgressTextStyles = (): TextStyle => ({
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  });

  const getStepIndicatorContainerStyles = (): ViewStyle => ({
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: showProgressBar ? 16 : 8,
  });

  const getStepIndicatorStyles = (stepNumber: number): ViewStyle => {
    const isCompleted = completedSteps.includes(stepNumber);
    const isCurrent = stepNumber === currentStep;
    const isAccessible = stepNumber <= currentStep || isCompleted;

    return {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isCompleted
        ? "#10B981"
        : isCurrent
        ? "#3B82F6"
        : isAccessible
        ? "#E5E7EB"
        : "#F3F4F6",
      borderWidth: isCurrent && !isCompleted ? 2 : 0,
      borderColor: "#3B82F6",
    };
  };

  const getStepIndicatorTextStyles = (stepNumber: number): TextStyle => {
    const isCompleted = completedSteps.includes(stepNumber);
    const isCurrent = stepNumber === currentStep;
    const isAccessible = stepNumber <= currentStep || isCompleted;

    return {
      fontSize: 14,
      fontWeight: "600",
      color:
        isCompleted || isCurrent
          ? "#FFFFFF"
          : isAccessible
          ? "#6B7280"
          : "#9CA3AF",
    };
  };

  const getStepLabelStyles = (stepNumber: number): TextStyle => {
    const isCompleted = completedSteps.includes(stepNumber);
    const isCurrent = stepNumber === currentStep;

    return {
      fontSize: 12,
      fontWeight: "500",
      color: isCompleted || isCurrent ? "#374151" : "#9CA3AF",
      textAlign: "center",
      marginTop: 4,
      maxWidth: 60,
    };
  };

  const getConnectorStyles = (stepNumber: number): ViewStyle => {
    const isCompleted = completedSteps.includes(stepNumber + 1);
    const isCurrentOrPrevious = stepNumber < currentStep;

    return {
      flex: 1,
      height: 2,
      backgroundColor:
        isCompleted || isCurrentOrPrevious ? "#10B981" : "#E5E7EB",
      marginHorizontal: 8,
      alignSelf: "center",
    };
  };

  return (
    <View style={getContainerStyles()}>
      {/* Header with step info and progress */}
      <View style={getHeaderStyles()}>
        <Text style={getStepTextStyles()}>
          {showStepNumbers && `Step ${currentStep} of ${totalSteps}`}
          {stepTitles[currentStep - 1] && ` - ${stepTitles[currentStep - 1]}`}
        </Text>
        <Text style={getProgressTextStyles()}>
          {progressPercentage}% Complete
        </Text>
      </View>

      {/* Progress bar */}
      {showProgressBar && (
        <ProgressBar
          progress={progress}
          color="#3B82F6"
          backgroundColor="#E5E7EB"
          height={6}
          showPercentage={false}
        />
      )}

      {/* Step indicators */}
      <View style={getStepIndicatorContainerStyles()}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isLast = stepNumber === totalSteps;

          return (
            <React.Fragment key={stepNumber}>
              <View style={{ alignItems: "center", flex: 0 }}>
                {/* Step circle */}
                <View style={getStepIndicatorStyles(stepNumber)}>
                  <Text style={getStepIndicatorTextStyles(stepNumber)}>
                    {completedSteps.includes(stepNumber) ? "✓" : stepNumber}
                  </Text>
                </View>

                {/* Step label */}
                {stepTitles[index] && (
                  <Text
                    style={getStepLabelStyles(stepNumber)}
                    numberOfLines={2}
                  >
                    {stepTitles[index]}
                  </Text>
                )}
              </View>

              {/* Connector line */}
              {!isLast && <View style={getConnectorStyles(stepNumber)} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

export {};
