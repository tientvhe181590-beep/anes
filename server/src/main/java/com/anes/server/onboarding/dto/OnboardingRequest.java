package com.anes.server.onboarding.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record OnboardingRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank String gender,
        @NotNull @Min(13) @Max(99) Integer age,
        @NotNull @Min(100) @Max(220) BigDecimal heightCm,
        @NotNull @Min(30) @Max(200) BigDecimal weightKg,
        @NotBlank String goal,
        BigDecimal targetWeightKg,
        List<String> targetMuscleGroups,
        @NotBlank String experienceLevel,
        List<String> injuries,
        List<String> allergies,
        List<String> dietPreferences,
        @NotNull @Min(2) @Max(6) Integer trainingDaysPerWeek,
        @NotBlank String trainingLocation,
        List<String> equipment
) {
}
