package com.anes.server.ai.service;

import com.anes.server.common.exception.EntityNotFoundException;
import com.anes.server.user.entity.ConditionType;
import com.anes.server.user.entity.User;
import com.anes.server.user.entity.UserHealthConstraint;
import com.anes.server.user.entity.UserPhysicalStats;
import com.anes.server.user.entity.UserPreferences;
import com.anes.server.user.repository.UserHealthConstraintRepository;
import com.anes.server.user.repository.UserPhysicalStatsRepository;
import com.anes.server.user.repository.UserPreferencesRepository;
import com.anes.server.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class AiContextBuilder {

    private final UserRepository userRepository;
    private final UserPhysicalStatsRepository userPhysicalStatsRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final UserHealthConstraintRepository userHealthConstraintRepository;
    private final ObjectMapper objectMapper;

    public AiContextBuilder(
            UserRepository userRepository,
            UserPhysicalStatsRepository userPhysicalStatsRepository,
            UserPreferencesRepository userPreferencesRepository,
            UserHealthConstraintRepository userHealthConstraintRepository,
            ObjectMapper objectMapper
    ) {
        this.userRepository = userRepository;
        this.userPhysicalStatsRepository = userPhysicalStatsRepository;
        this.userPreferencesRepository = userPreferencesRepository;
        this.userHealthConstraintRepository = userHealthConstraintRepository;
        this.objectMapper = objectMapper;
    }

    public String buildContext(Long userId) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        UserPhysicalStats stats = userPhysicalStatsRepository
                .findTopByUserIdAndDeletedFalseOrderByRecordedAtDesc(userId)
                .orElse(null);

        UserPreferences preferences = userPreferencesRepository
                .findByUserIdAndDeletedFalse(userId)
                .orElse(null);

        List<UserHealthConstraint> constraints = userHealthConstraintRepository
                .findAllByUserIdAndDeletedFalse(userId);

        StringBuilder context = new StringBuilder();
        context.append("User profile:\n");
        context.append("- Gender: ").append(user.getGender()).append("\n");
        context.append("- Age: ").append(extractAge(stats != null ? stats.getHealthData() : null)).append("\n");
        context.append("- Weight (kg): ").append(stats != null ? stats.getWeightKg() : "unknown").append("\n");
        context.append("- Height (cm): ").append(stats != null ? stats.getHeightCm() : "unknown").append("\n\n");

        context.append("Preferences:\n");
        context.append("- Goal: ").append(preferences != null ? preferences.getGoalType() : "unknown").append("\n");
        context.append("- Training days/week: ").append(preferences != null ? preferences.getSessionsPerWeek() : "unknown").append("\n");
        context.append("- Location: ").append(preferences != null ? preferences.getTrainingLocation() : "unknown").append("\n");
        context.append("- Equipment: ").append(preferences != null ? preferences.getAvailableTools() : "none").append("\n");
        context.append("- Target muscles: ").append(preferences != null ? preferences.getTargetMuscleGroups() : "none").append("\n\n");

        List<String> injuries = constraints.stream()
                .filter(constraint -> constraint.getCondition().getType() == ConditionType.INJURY)
                .map(constraint -> constraint.getCondition().getName())
                .toList();

        List<String> allergies = constraints.stream()
                .filter(constraint -> constraint.getCondition().getType() == ConditionType.ALLERGY)
                .map(constraint -> constraint.getCondition().getName())
                .toList();

        context.append("Health constraints:\n");
        context.append("- Injuries: ").append(formatList(injuries)).append("\n");
        context.append("- Allergies: ").append(formatList(allergies)).append("\n");

        return context.toString();
    }

    private String extractAge(String healthData) {
        if (healthData == null || healthData.isBlank()) {
            return "unknown";
        }
        try {
            JsonNode node = objectMapper.readTree(healthData);
            return String.valueOf(node.path("age").asInt(0));
        } catch (Exception ex) {
            return "unknown";
        }
    }

    private String formatList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "none";
        }
        return values.stream()
                .map(value -> value.trim().toLowerCase(Locale.ROOT))
                .collect(Collectors.joining(", "));
    }
}
