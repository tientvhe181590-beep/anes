package com.anes.server.dashboard.dto;

public record DashboardSummaryDTO(
        int streakDays,
        CalorieInfo calorieInfo,
        WorkoutInfo workoutInfo) {
    public record CalorieInfo(int consumed, int target) {
    }

    public record WorkoutInfo(String id, String title, int durationMinutes, String intensity) {
    }
}
