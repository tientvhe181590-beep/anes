package com.anes.server.dashboard.service;

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
import com.anes.server.workout.entity.WorkoutTemplate;
import com.anes.server.workout.entity.WorkoutTemplateExercise;
import com.anes.server.workout.repository.UserWorkoutScheduleRepository;
import com.anes.server.workout.repository.WorkoutTemplateExerciseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserPhysicalStatsRepository userPhysicalStatsRepository;

    @Mock
    private UserPreferencesRepository userPreferencesRepository;

    @Mock
    private UserDailyNutritionRepository userDailyNutritionRepository;

    @Mock
    private UserWorkoutScheduleRepository userWorkoutScheduleRepository;

    @Mock
    private WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository;

    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(
                userRepository,
                userPhysicalStatsRepository,
                userPreferencesRepository,
                userDailyNutritionRepository,
                userWorkoutScheduleRepository,
                workoutTemplateExerciseRepository,
                new ObjectMapper());
    }

    @Test
    void getSummaryCalculatesBmrAndStreak() {
        User user = new User();
        user.setId(7L);
        user.setGender(Gender.MALE);
        when(userRepository.findByIdAndDeletedFalse(7L)).thenReturn(Optional.of(user));

        UserPhysicalStats stats = new UserPhysicalStats();
        stats.setWeightKg(new BigDecimal("80"));
        stats.setHeightCm(new BigDecimal("180"));
        stats.setActivityLevel(ActivityLevel.LOW);
        stats.setHealthData("{\"age\":30}");
        when(userPhysicalStatsRepository
                .findTopByUserIdAndDeletedFalseOrderByRecordedAtDesc(7L))
                .thenReturn(Optional.of(stats));

        UserPreferences preferences = new UserPreferences();
        preferences.setGoalType(GoalType.STAY_FIT);
        when(userPreferencesRepository.findByUserIdAndDeletedFalse(7L))
                .thenReturn(Optional.of(preferences));

        UserDailyNutrition nutrition = new UserDailyNutrition();
        nutrition.setTotalCalories(new BigDecimal("2000"));
        nutrition.setTotalProtein(new BigDecimal("150.4"));
        nutrition.setTotalCarbs(new BigDecimal("220.6"));
        nutrition.setTotalFat(new BigDecimal("60.1"));
        when(userDailyNutritionRepository.findByUserIdAndDateAndDeletedFalse(any(), any()))
                .thenReturn(Optional.of(nutrition));

        WorkoutTemplate template = new WorkoutTemplate();
        template.setId(99L);
        template.setFocusArea("Full Body");
        template.setEstimatedDurationMins(45);

        LocalDate today = LocalDate.now();
        UserWorkoutSchedule todaySchedule = new UserWorkoutSchedule();
        todaySchedule.setId(500L);
        todaySchedule.setTemplate(template);
        todaySchedule.setScheduledDate(today);
        todaySchedule.setStatus(ScheduleStatus.COMPLETED);

        when(userWorkoutScheduleRepository.findByUserIdAndScheduledDateAndDeletedFalse(7L, today))
                .thenReturn(Optional.of(todaySchedule));

        when(workoutTemplateExerciseRepository.findAllByTemplateIdOrderByOrderIndex(99L))
                .thenReturn(List.of(new WorkoutTemplateExercise(), new WorkoutTemplateExercise()));

        UserWorkoutSchedule completed1 = new UserWorkoutSchedule();
        completed1.setStatus(ScheduleStatus.COMPLETED);
        completed1.setScheduledDate(today.minusDays(1));

        UserWorkoutSchedule completed2 = new UserWorkoutSchedule();
        completed2.setStatus(ScheduleStatus.COMPLETED);
        completed2.setScheduledDate(today.minusDays(3));

        when(userWorkoutScheduleRepository.findAllByUserIdAndDeletedFalseOrderByScheduledDate(7L))
                .thenReturn(List.of(completed2, completed1));

        when(userWorkoutScheduleRepository
                .findAllByUserIdAndScheduledDateBetweenAndDeletedFalseOrderByScheduledDate(
                        eq(7L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

        DashboardSummaryResponse response = dashboardService.getSummary(7L);

        assertThat(response.calorieTarget()).isEqualTo(2136);
        assertThat(response.caloriesConsumed()).isEqualTo(2000);
        assertThat(response.macros().protein()).isEqualTo(150);
        assertThat(response.macros().carbs()).isEqualTo(221);
        assertThat(response.macros().fat()).isEqualTo(60);
        assertThat(response.streak().currentDays()).isEqualTo(2);
        assertThat(response.todayWorkout().exerciseCount()).isEqualTo(2);
        assertThat(response.todayWorkout().status()).isEqualTo("Completed");
    }
}
