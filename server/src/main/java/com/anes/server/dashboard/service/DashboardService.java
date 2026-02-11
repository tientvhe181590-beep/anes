package com.anes.server.dashboard.service;

import com.anes.server.common.exception.EntityNotFoundException;
import com.anes.server.dashboard.dto.DashboardSummaryResponse;
import com.anes.server.nutrition.entity.UserDailyNutrition;
import com.anes.server.nutrition.repository.UserDailyNutritionRepository;
import com.anes.server.user.entity.ActivityLevel;
import com.anes.server.user.entity.Gender;
import com.anes.server.user.entity.GoalType;
import com.anes.server.user.entity.User;
import com.anes.server.user.entity.UserPhysicalStats;
import com.anes.server.user.entity.UserPreferences;
import com.anes.server.user.repository.UserPhysicalStatsRepository;
import com.anes.server.user.repository.UserPreferencesRepository;
import com.anes.server.user.repository.UserRepository;
import com.anes.server.workout.entity.ScheduleStatus;
import com.anes.server.workout.entity.UserWorkoutSchedule;
import com.anes.server.workout.entity.WorkoutTemplateExercise;
import com.anes.server.workout.repository.UserWorkoutScheduleRepository;
import com.anes.server.workout.repository.WorkoutTemplateExerciseRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final UserPhysicalStatsRepository userPhysicalStatsRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final UserDailyNutritionRepository userDailyNutritionRepository;
    private final UserWorkoutScheduleRepository userWorkoutScheduleRepository;
    private final WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository;
    private final ObjectMapper objectMapper;

    public DashboardService(
            UserRepository userRepository,
            UserPhysicalStatsRepository userPhysicalStatsRepository,
            UserPreferencesRepository userPreferencesRepository,
            UserDailyNutritionRepository userDailyNutritionRepository,
            UserWorkoutScheduleRepository userWorkoutScheduleRepository,
            WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository,
            ObjectMapper objectMapper
    ) {
        this.userRepository = userRepository;
        this.userPhysicalStatsRepository = userPhysicalStatsRepository;
        this.userPreferencesRepository = userPreferencesRepository;
        this.userDailyNutritionRepository = userDailyNutritionRepository;
        this.userWorkoutScheduleRepository = userWorkoutScheduleRepository;
        this.workoutTemplateExerciseRepository = workoutTemplateExerciseRepository;
        this.objectMapper = objectMapper;
    }

    public DashboardSummaryResponse getSummary(Long userId) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        UserPhysicalStats stats = userPhysicalStatsRepository
                .findTopByUserIdAndDeletedFalseOrderByRecordedAtDesc(userId)
                .orElse(null);

        UserPreferences preferences = userPreferencesRepository
                .findByUserIdAndDeletedFalse(userId)
                .orElse(null);

        int calorieTarget = calculateCalorieTarget(user, stats, preferences);
        int caloriesConsumed = fetchCaloriesConsumed(userId);
        DashboardSummaryResponse.Macros macros = fetchMacros(userId);
        DashboardSummaryResponse.Streak streak = calculateStreak(userId);
        DashboardSummaryResponse.TodayWorkout todayWorkout = buildTodayWorkout(userId);
        List<DashboardSummaryResponse.WeekDayStatus> weekSchedule = buildWeekSchedule(userId);

        return new DashboardSummaryResponse(
                calorieTarget,
                caloriesConsumed,
                macros,
                streak,
                todayWorkout,
                weekSchedule
        );
    }

    private int calculateCalorieTarget(User user, UserPhysicalStats stats, UserPreferences preferences) {
        if (stats == null || stats.getWeightKg() == null || stats.getHeightCm() == null) {
            return 0;
        }

        int age = extractAge(stats.getHealthData());
        double bmr = calculateBmr(user.getGender(), stats.getWeightKg(), stats.getHeightCm(), age);
        double tdee = bmr * activityMultiplier(stats.getActivityLevel());
        double target = adjustForGoal(tdee, preferences != null ? preferences.getGoalType() : null);

        return (int) Math.round(target);
    }

    private int fetchCaloriesConsumed(Long userId) {
        LocalDate today = LocalDate.now();
        Optional<UserDailyNutrition> nutrition = userDailyNutritionRepository
                .findByUserIdAndDateAndDeletedFalse(userId, today);
        return nutrition
                .map(UserDailyNutrition::getTotalCalories)
                .map(value -> value.setScale(0, RoundingMode.HALF_UP).intValue())
                .orElse(0);
    }

    private DashboardSummaryResponse.Macros fetchMacros(Long userId) {
        LocalDate today = LocalDate.now();
        Optional<UserDailyNutrition> nutrition = userDailyNutritionRepository
                .findByUserIdAndDateAndDeletedFalse(userId, today);

        int protein = nutrition.map(UserDailyNutrition::getTotalProtein)
                .map(this::roundInt)
                .orElse(0);
        int carbs = nutrition.map(UserDailyNutrition::getTotalCarbs)
                .map(this::roundInt)
                .orElse(0);
        int fat = nutrition.map(UserDailyNutrition::getTotalFat)
                .map(this::roundInt)
                .orElse(0);

        return new DashboardSummaryResponse.Macros(protein, carbs, fat);
    }

    private DashboardSummaryResponse.Streak calculateStreak(Long userId) {
        List<UserWorkoutSchedule> completed = userWorkoutScheduleRepository
                .findAllByUserIdAndDeletedFalseOrderByScheduledDate(userId)
                .stream()
                .filter(schedule -> schedule.getStatus() == ScheduleStatus.COMPLETED)
                .sorted(Comparator.comparing(UserWorkoutSchedule::getScheduledDate).reversed())
                .toList();

        if (completed.isEmpty()) {
            return new DashboardSummaryResponse.Streak(0, null);
        }

        LocalDate lastDate = completed.getFirst().getScheduledDate();
        int streak = 1;

        for (int i = 1; i < completed.size(); i++) {
            LocalDate current = completed.get(i - 1).getScheduledDate();
            LocalDate next = completed.get(i).getScheduledDate();
            long diff = ChronoUnit.DAYS.between(next, current);
            if (diff <= 2) {
                streak++;
            } else {
                break;
            }
        }

        return new DashboardSummaryResponse.Streak(streak, lastDate);
    }

    private DashboardSummaryResponse.TodayWorkout buildTodayWorkout(Long userId) {
        LocalDate today = LocalDate.now();
        Optional<UserWorkoutSchedule> scheduleOpt = userWorkoutScheduleRepository
                .findByUserIdAndScheduledDateAndDeletedFalse(userId, today);

        if (scheduleOpt.isEmpty()) {
            return null;
        }

        UserWorkoutSchedule schedule = scheduleOpt.get();
        List<WorkoutTemplateExercise> exercises = workoutTemplateExerciseRepository
                .findAllByTemplateIdOrderByOrderIndex(schedule.getTemplate().getId());

        return new DashboardSummaryResponse.TodayWorkout(
                schedule.getId(),
                schedule.getTemplate().getFocusArea(),
                schedule.getTemplate().getEstimatedDurationMins(),
                exercises.size(),
                toTitleCase(schedule.getStatus().name())
        );
    }

    private List<DashboardSummaryResponse.WeekDayStatus> buildWeekSchedule(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate end = start.plusDays(6);

        List<UserWorkoutSchedule> schedules = userWorkoutScheduleRepository
                .findAllByUserIdAndScheduledDateBetweenAndDeletedFalseOrderByScheduledDate(
                        userId, start, end);

        Map<LocalDate, UserWorkoutSchedule> byDate = schedules.stream()
                .collect(Collectors.toMap(UserWorkoutSchedule::getScheduledDate, schedule -> schedule));

        List<DashboardSummaryResponse.WeekDayStatus> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = start.plusDays(i);
            UserWorkoutSchedule schedule = byDate.get(date);
            String status;
            if (schedule == null) {
                status = "rest";
            } else if (schedule.getStatus() == ScheduleStatus.COMPLETED) {
                status = "completed";
            } else if (date.equals(today)) {
                status = "today";
            } else {
                status = "upcoming";
            }

            result.add(new DashboardSummaryResponse.WeekDayStatus(dayLabel(date), status));
        }

        return result;
    }

    private double calculateBmr(Gender gender, BigDecimal weightKg, BigDecimal heightCm, int age) {
        double weight = weightKg.doubleValue();
        double height = heightCm.doubleValue();
        double base = (10 * weight) + (6.25 * height) - (5 * age);

        if (gender == Gender.FEMALE) {
            return base - 161;
        }
        if (gender == Gender.MALE) {
            return base + 5;
        }
        return base;
    }

    private double activityMultiplier(ActivityLevel level) {
        if (level == null) {
            return 1.2;
        }
        return switch (level) {
            case LOW -> 1.2;
            case MEDIUM -> 1.55;
            case HIGH -> 1.725;
        };
    }

    private double adjustForGoal(double tdee, GoalType goalType) {
        if (goalType == null) {
            return tdee;
        }
        return switch (goalType) {
            case WEIGHT_LOSS -> tdee - 500;
            case WEIGHT_GAIN -> tdee + 500;
            case MUSCLE_GAIN -> tdee + 300;
            case STAY_FIT -> tdee;
        };
    }

    private int roundInt(BigDecimal value) {
        if (value == null) {
            return 0;
        }
        return value.setScale(0, RoundingMode.HALF_UP).intValue();
    }

    private int extractAge(String healthData) {
        if (healthData == null || healthData.isBlank()) {
            return 0;
        }
        try {
            JsonNode node = objectMapper.readTree(healthData);
            return node.path("age").asInt(0);
        } catch (Exception ex) {
            return 0;
        }
    }

    private String dayLabel(LocalDate date) {
        return date.getDayOfWeek().name().substring(0, 1)
                + date.getDayOfWeek().name().substring(1, 3).toLowerCase(Locale.ROOT);
    }

    private String toTitleCase(String input) {
        String lower = input.toLowerCase(Locale.ROOT);
        return lower.substring(0, 1).toUpperCase(Locale.ROOT) + lower.substring(1);
    }
}
