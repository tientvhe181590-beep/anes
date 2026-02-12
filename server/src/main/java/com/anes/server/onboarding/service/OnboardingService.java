package com.anes.server.onboarding.service;

import com.anes.server.common.exception.EntityNotFoundException;
import com.anes.server.onboarding.dto.OnboardingRequest;
import com.anes.server.ai.dto.GeneratePlanRequest;
import com.anes.server.ai.service.AiService;
import com.anes.server.user.entity.ActivityLevel;
import com.anes.server.user.entity.ConditionType;
import com.anes.server.user.entity.ExperienceLevel;
import com.anes.server.user.entity.Gender;
import com.anes.server.user.entity.GoalType;
import com.anes.server.user.entity.HealthCondition;
import com.anes.server.user.entity.TrainingLocation;
import com.anes.server.user.entity.User;
import com.anes.server.user.entity.UserHealthConstraint;
import com.anes.server.user.entity.UserPhysicalStats;
import com.anes.server.user.entity.UserPreferences;
import com.anes.server.user.repository.HealthConditionRepository;
import com.anes.server.user.repository.UserHealthConstraintRepository;
import com.anes.server.user.repository.UserPhysicalStatsRepository;
import com.anes.server.user.repository.UserPreferencesRepository;
import com.anes.server.user.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class OnboardingService {

    private final UserRepository userRepository;
    private final UserPhysicalStatsRepository userPhysicalStatsRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final UserHealthConstraintRepository userHealthConstraintRepository;
    private final HealthConditionRepository healthConditionRepository;
    private final ObjectMapper objectMapper;
    private final AiService aiService;

    public OnboardingService(
            UserRepository userRepository,
            UserPhysicalStatsRepository userPhysicalStatsRepository,
            UserPreferencesRepository userPreferencesRepository,
            UserHealthConstraintRepository userHealthConstraintRepository,
            HealthConditionRepository healthConditionRepository,
            ObjectMapper objectMapper,
            AiService aiService
    ) {
        this.userRepository = userRepository;
        this.userPhysicalStatsRepository = userPhysicalStatsRepository;
        this.userPreferencesRepository = userPreferencesRepository;
        this.userHealthConstraintRepository = userHealthConstraintRepository;
        this.healthConditionRepository = healthConditionRepository;
        this.objectMapper = objectMapper;
        this.aiService = aiService;
    }

    public void completeOnboarding(Long userId, OnboardingRequest request) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        user.setFullName(request.name());
        user.setGender(parseGender(request.gender()));
        user.setOnboardingComplete(true);
        userRepository.save(user);

        UserPhysicalStats stats = new UserPhysicalStats();
        stats.setUser(user);
        stats.setWeightKg(request.weightKg());
        stats.setHeightCm(request.heightCm());
        stats.setBmi(calculateBmi(request.weightKg(), request.heightCm()));
        stats.setBmr(calculateBmr(request));
        stats.setActivityLevel(deriveActivityLevel(request.trainingDaysPerWeek()));
        stats.setRecordedAt(LocalDate.now());
        stats.setHealthData(serializeAge(request.age()));
        userPhysicalStatsRepository.save(stats);

        UserPreferences preferences = userPreferencesRepository.findByUserIdAndDeletedFalse(userId)
                .orElseGet(UserPreferences::new);
        preferences.setUser(user);
        preferences.setGoalType(parseGoalType(request.goal()));
        preferences.setTargetWeight(request.targetWeightKg());
        preferences.setSessionsPerWeek(request.trainingDaysPerWeek());
        preferences.setTrainingLocation(parseTrainingLocation(request.trainingLocation()));
        preferences.setAvailableTools(joinList(request.equipment()));
        preferences.setTargetMuscleGroups(joinList(request.targetMuscleGroups()));
        preferences.setExperienceLevel(parseExperienceLevel(request.experienceLevel()));
        userPreferencesRepository.save(preferences);

        List<UserHealthConstraint> existing = userHealthConstraintRepository
                .findAllByUserIdAndDeletedFalse(userId);
        existing.forEach(constraint -> constraint.setDeleted(true));
        userHealthConstraintRepository.saveAll(existing);

        List<HealthCondition> conditions = new ArrayList<>();
        conditions.addAll(resolveConditions(request.injuries(), ConditionType.INJURY));
        conditions.addAll(resolveConditions(request.allergies(), ConditionType.ALLERGY));

        for (HealthCondition condition : conditions) {
            UserHealthConstraint constraint = new UserHealthConstraint();
            constraint.setUser(user);
            constraint.setCondition(condition);
            userHealthConstraintRepository.save(constraint);
        }

        aiService.generatePlan(userId, new GeneratePlanRequest(false));
    }

    private List<HealthCondition> resolveConditions(List<String> names, ConditionType type) {
        if (names == null || names.isEmpty()) {
            return List.of();
        }

        List<String> filtered = names.stream()
                .filter(name -> name != null && !name.isBlank())
                .filter(name -> !"none".equalsIgnoreCase(name))
                .toList();

        if (filtered.isEmpty()) {
            return List.of();
        }

        List<HealthCondition> existing = healthConditionRepository.findAllByNameIn(filtered);
        List<String> existingNames = existing.stream()
                .map(HealthCondition::getName)
                .map(name -> name.toLowerCase(Locale.ROOT))
                .toList();

        List<HealthCondition> created = new ArrayList<>();
        for (String name : filtered) {
            if (!existingNames.contains(name.toLowerCase(Locale.ROOT))) {
                HealthCondition condition = new HealthCondition();
                condition.setName(name);
                condition.setType(type);
                created.add(healthConditionRepository.save(condition));
            }
        }

        List<HealthCondition> result = new ArrayList<>(existing);
        result.addAll(created);
        return result;
    }

    private Gender parseGender(String gender) {
        if (gender == null) {
            return null;
        }
        String normalized = gender.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "MALE" -> Gender.MALE;
            case "FEMALE" -> Gender.FEMALE;
            default -> Gender.OTHER;
        };
    }

    private GoalType parseGoalType(String goal) {
        if (goal == null) {
            return null;
        }
        String normalized = goal.trim().toUpperCase(Locale.ROOT).replace(" ", "_");
        return switch (normalized) {
            case "WEIGHTLOSS", "WEIGHT_LOSS" -> GoalType.WEIGHT_LOSS;
            case "WEIGHTGAIN", "WEIGHT_GAIN" -> GoalType.WEIGHT_GAIN;
            case "MUSCLEGAIN", "MUSCLE_GAIN" -> GoalType.MUSCLE_GAIN;
            default -> GoalType.STAY_FIT;
        };
    }

    private ExperienceLevel parseExperienceLevel(String level) {
        if (level == null) {
            return null;
        }
        String normalized = level.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "BASIC", "BEGINNER" -> ExperienceLevel.BEGINNER;
            case "INTERMEDIATE" -> ExperienceLevel.INTERMEDIATE;
            default -> ExperienceLevel.ADVANCED;
        };
    }

    private TrainingLocation parseTrainingLocation(String location) {
        if (location == null) {
            return null;
        }
        String normalized = location.trim().toUpperCase(Locale.ROOT);
        return "HOME".equals(normalized) ? TrainingLocation.HOME : TrainingLocation.GYM;
    }

    private ActivityLevel deriveActivityLevel(Integer daysPerWeek) {
        if (daysPerWeek == null) {
            return ActivityLevel.LOW;
        }
        if (daysPerWeek <= 3) {
            return ActivityLevel.LOW;
        }
        if (daysPerWeek <= 5) {
            return ActivityLevel.MEDIUM;
        }
        return ActivityLevel.HIGH;
    }

    private BigDecimal calculateBmi(BigDecimal weightKg, BigDecimal heightCm) {
        if (weightKg == null || heightCm == null || heightCm.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        BigDecimal heightMeters = heightCm.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal bmi = weightKg.divide(heightMeters.multiply(heightMeters), 4, RoundingMode.HALF_UP);
        return bmi.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateBmr(OnboardingRequest request) {
        if (request.weightKg() == null || request.heightCm() == null || request.age() == null) {
            return null;
        }
        double weight = request.weightKg().doubleValue();
        double height = request.heightCm().doubleValue();
        double age = request.age();

        double base = (10 * weight) + (6.25 * height) - (5 * age);
        double bmr = switch (parseGender(request.gender())) {
            case MALE -> base + 5;
            case FEMALE -> base - 161;
            default -> base;
        };

        return BigDecimal.valueOf(bmr).setScale(2, RoundingMode.HALF_UP);
    }

    private String serializeAge(Integer age) {
        if (age == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(new AgePayload(age));
        } catch (JsonProcessingException ex) {
            return null;
        }
    }

    private String joinList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return String.join(",", values);
    }

    private record AgePayload(int age) {
    }
}
