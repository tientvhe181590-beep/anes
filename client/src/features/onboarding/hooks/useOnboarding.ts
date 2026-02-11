import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useAuthStore } from "@/app/store";
import { submitOnboarding } from "../api/onboarding.api";
import {
  type OnboardingData,
  type OnboardingRequest,
  INITIAL_ONBOARDING_DATA,
} from "../types/onboarding.types";

type StepId =
  | "basics"
  | "stats"
  | "goal"
  | "targetWeight"
  | "focusArea"
  | "experience"
  | "injuries"
  | "allergies"
  | "availability";

interface StepError {
  field: string;
  message: string;
}

export function useOnboarding() {
  const navigate = useNavigate();
  const { setUser, user } = useAuthStore();
  const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errors, setErrors] = useState<StepError[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  // Build dynamic step sequence based on goal
  const steps: StepId[] = useMemo(() => {
    const base: StepId[] = ["basics", "stats", "goal"];

    if (data.goal === "WeightLoss" || data.goal === "WeightGain") {
      base.push("targetWeight");
    } else if (data.goal === "MuscleGain") {
      base.push("focusArea");
    }

    base.push("experience", "injuries", "allergies", "availability");
    return base;
  }, [data.goal]);

  const currentStep = steps[currentStepIndex];
  const totalVisualSteps = 7; // Always show "Step N of 7" per spec

  // Map current step to visual step number (1-7)
  const visualStepNumber = useMemo(() => {
    const stepToVisual: Record<StepId, number> = {
      basics: 1,
      stats: 2,
      goal: 3,
      targetWeight: 3, // sub-step of goal
      focusArea: 3, // sub-step of goal
      experience: 4,
      injuries: 5,
      allergies: 6,
      availability: 7,
    };
    return stepToVisual[currentStep];
  }, [currentStep]);

  const updateData = useCallback(
    (partial: Partial<OnboardingData>) => {
      setData((prev) => ({ ...prev, ...partial }));
      setErrors([]);
    },
    [],
  );

  const validateStep = useCallback(
    (step: StepId): StepError[] => {
      const errs: StepError[] = [];

      switch (step) {
        case "basics":
          if (!data.name.trim()) errs.push({ field: "name", message: "Name is required" });
          if (!data.gender) errs.push({ field: "gender", message: "Please select your gender" });
          break;

        case "stats":
          if (!data.age || data.age < 13 || data.age > 99)
            errs.push({ field: "age", message: "Age must be between 13 and 99" });
          if (data.heightCm < 100 || data.heightCm > 220)
            errs.push({ field: "heightCm", message: "Height must be between 100 and 220 cm" });
          if (data.weightKg < 30 || data.weightKg > 200)
            errs.push({ field: "weightKg", message: "Weight must be between 30 and 200 kg" });
          break;

        case "goal":
          if (!data.goal) errs.push({ field: "goal", message: "Please select a fitness goal" });
          break;

        case "targetWeight":
          if (!data.targetWeightKg || data.targetWeightKg < 30 || data.targetWeightKg > 200) {
            errs.push({ field: "targetWeightKg", message: "Please set a valid target weight" });
          } else if (data.goal === "WeightLoss" && data.targetWeightKg >= data.weightKg) {
            errs.push({
              field: "targetWeightKg",
              message: "Target weight must be less than current weight for weight loss",
            });
          } else if (data.goal === "WeightGain" && data.targetWeightKg <= data.weightKg) {
            errs.push({
              field: "targetWeightKg",
              message: "Target weight must be greater than current weight for weight gain",
            });
          }
          break;

        case "focusArea":
          if (data.targetMuscleGroups.length === 0)
            errs.push({ field: "targetMuscleGroups", message: "Select at least one muscle group" });
          break;

        case "experience":
          if (!data.experienceLevel)
            errs.push({ field: "experienceLevel", message: "Please select your experience level" });
          break;

        case "injuries":
          if (data.injuries.length === 0)
            errs.push({ field: "injuries", message: "Please select at least one option or None" });
          break;

        case "allergies":
          if (data.allergies.length === 0)
            errs.push({ field: "allergies", message: "Please select at least one option or None" });
          break;

        case "availability":
          if (!data.trainingDaysPerWeek)
            errs.push({ field: "trainingDaysPerWeek", message: "Please select training days per week" });
          if (!data.trainingLocation)
            errs.push({ field: "trainingLocation", message: "Please select training location" });
          break;
      }

      return errs;
    },
    [data],
  );

  const mutation = useMutation({
    mutationFn: submitOnboarding,
    onSuccess: () => {
      if (user) {
        setUser({ ...user, onboardingComplete: true });
      }
      navigate("/dashboard", { replace: true });
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        setServerError(
          error.response?.data?.message ?? "Unable to complete setup. Please check your connection and try again.",
        );
      } else {
        setServerError("Unable to complete setup. Please check your connection and try again.");
      }
    },
  });

  const goNext = useCallback(() => {
    const stepErrors = validateStep(currentStep);
    if (stepErrors.length > 0) {
      setErrors(stepErrors);
      return;
    }

    setErrors([]);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      // Final step — submit
      setServerError(null);

      // Separate diet prefs from allergies
      const dietKeywords = ["Keto", "Vegan", "Vegetarian", "Low Carb", "No Preference"];
      const dietPreferences = data.allergies.filter((a) => dietKeywords.includes(a));
      const allergiesOnly = data.allergies.filter(
        (a) => !dietKeywords.includes(a) && a !== "None",
      );
      const injuriesOnly = data.injuries.filter((i) => i !== "None");

      const request: OnboardingRequest = {
        name: data.name.trim(),
        gender: data.gender!,
        age: data.age!,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        goal: data.goal!,
        targetWeightKg:
          data.goal === "WeightLoss" || data.goal === "WeightGain"
            ? data.targetWeightKg
            : null,
        targetMuscleGroups:
          data.goal === "MuscleGain" ? data.targetMuscleGroups : null,
        experienceLevel: data.experienceLevel!,
        injuries: injuriesOnly,
        allergies: allergiesOnly,
        dietPreferences,
        trainingDaysPerWeek: data.trainingDaysPerWeek!,
        trainingLocation: data.trainingLocation!,
        equipment: data.equipment.length > 0 ? data.equipment : ["None"],
      };

      mutation.mutate(request);
    }
  }, [currentStep, currentStepIndex, steps, data, validateStep, mutation]);

  const goBack = useCallback(() => {
    setErrors([]);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    }
  }, [currentStepIndex]);

  const getError = useCallback(
    (field: string) => errors.find((e) => e.field === field)?.message ?? null,
    [errors],
  );

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return {
    data,
    updateData,
    currentStep,
    visualStepNumber,
    totalVisualSteps,
    goNext,
    goBack,
    isFirstStep,
    isLastStep,
    errors,
    getError,
    serverError,
    isSubmitting: mutation.isPending,
  };
}
