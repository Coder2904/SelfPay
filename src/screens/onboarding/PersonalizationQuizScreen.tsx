import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { OnboardingProgressIndicator } from "../../components/ui/OnboardingProgressIndicator";
import { useOnboarding } from "../../hooks/useOnboarding";
import { onboardingService } from "../../services/OnboardingService";
import type { OnboardingStackScreenProps } from "../../types/navigation";

type PersonalizationQuizScreenProps =
  OnboardingStackScreenProps<"PersonalizationQuiz">;

interface QuizAnswers {
  experience_level?: string;
  work_motivation?: string[];
  work_schedule?: string;
  income_priority?: string;
}

export const PersonalizationQuizScreen: React.FC<
  PersonalizationQuizScreenProps
> = ({ navigation }) => {
  const {
    currentStep,
    totalSteps,
    completedSteps,
    updateResponse,
    nextStep,
    isUpdatingResponse,
  } = useOnboarding();

  const [answers, setAnswers] = useState<QuizAnswers>({
    work_motivation: [],
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const questions = onboardingService.getPersonalizationQuiz();
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSingleChoice = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultipleChoice = (questionId: string, value: string) => {
    setAnswers((prev) => {
      const currentValues =
        (prev[questionId as keyof QuizAnswers] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [questionId]: newValues };
    });
  };

  const isQuestionAnswered = (question: any): boolean => {
    const answer = answers[question.id as keyof QuizAnswers];
    if (question.type === "multiple") {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };

  const canProceed = (): boolean => {
    if (!currentQuestion.required) return true;
    return isQuestionAnswered(currentQuestion);
  };

  const handleNext = () => {
    if (!canProceed()) {
      Alert.alert("Required", "Please answer this question to continue.");
      return;
    }

    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Convert quiz answers to PersonalInfo format
      const personalInfo = {
        firstName: "", // Will be filled in next step
        lastName: "", // Will be filled in next step
        quizResponses: answers,
      };

      await updateResponse({ step: 1, response: personalInfo });
      nextStep();
      navigation.navigate("PlatformSelection");
    } catch (error) {
      console.error("Failed to save quiz responses:", error);
      Alert.alert("Error", "Failed to save your responses. Please try again.");
    }
  };

  const renderSingleChoice = (question: any) => (
    <View style={{ gap: 12 }}>
      {question.options?.map((option: string, index: number) => {
        const isSelected = answers[question.id as keyof QuizAnswers] === option;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleSingleChoice(question.id, option)}
          >
            <Card
              variant={isSelected ? "elevated" : "outlined"}
              style={{
                borderColor: isSelected ? "#3B82F6" : "#E5E7EB",
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
                    borderColor: isSelected ? "#3B82F6" : "#D1D5DB",
                    backgroundColor: isSelected ? "#3B82F6" : "transparent",
                    marginRight: 12,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {isSelected && (
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
                <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                  {option}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderMultipleChoice = (question: any) => (
    <View style={{ gap: 12 }}>
      {question.options?.map((option: string, index: number) => {
        const selectedOptions =
          (answers[question.id as keyof QuizAnswers] as string[]) || [];
        const isSelected = selectedOptions.includes(option);
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleMultipleChoice(question.id, option)}
          >
            <Card
              variant={isSelected ? "elevated" : "outlined"}
              style={{
                borderColor: isSelected ? "#3B82F6" : "#E5E7EB",
                borderWidth: 2,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: isSelected ? "#3B82F6" : "#D1D5DB",
                    backgroundColor: isSelected ? "#3B82F6" : "transparent",
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
                  {option}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        );
      })}
    </View>
  );

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
            Let's get to know you
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#6B7280",
              lineHeight: 24,
            }}
          >
            Answer a few questions to personalize your SelfPay experience
          </Text>
        </View>

        {/* Question Progress */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: "#6B7280",
              marginBottom: 8,
            }}
          >
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <View
            style={{
              height: 4,
              backgroundColor: "#E5E7EB",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                backgroundColor: "#3B82F6",
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            />
          </View>
        </View>

        {/* Current Question */}
        <Card variant="elevated" style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 20,
              lineHeight: 28,
            }}
          >
            {currentQuestion.question}
            {currentQuestion.required && (
              <Text style={{ color: "#EF4444" }}> *</Text>
            )}
          </Text>

          {currentQuestion.type === "single" &&
            renderSingleChoice(currentQuestion)}
          {currentQuestion.type === "multiple" &&
            renderMultipleChoice(currentQuestion)}
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
            isDisabled={currentQuestionIndex === 0}
            style={{ flex: 1 }}
          />
          <Button
            title={isLastQuestion ? "Complete" : "Next"}
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

export default PersonalizationQuizScreen;
