package com.anes.server.dashboard.dto;

import java.time.LocalDate;
import java.util.List;

public record DashboardSummaryResponse(
        int calorieTarget,
        int caloriesConsumed,
        Macros macros,
        Streak streak,
        TodayWorkout todayWorkout,
        List<WeekDayStatus> weekSchedule
) {
    public record Macros(int protein, int carbs, int fat) {
    }

    public record Streak(int currentDays, LocalDate lastWorkoutDate) {
    }

    public record TodayWorkout(
            Long scheduleId,
            String title,
            Integer estimatedDurationMins,
            int exerciseCount,
            String status
    ) {
    }

    public record WeekDayStatus(String day, String status) {
    }
}
