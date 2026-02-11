package com.anes.server.ai.dto;

public record PlanExerciseDto(
        String name,
        Integer sets,
        Integer reps,
        Integer restTimeSec
) {
}
