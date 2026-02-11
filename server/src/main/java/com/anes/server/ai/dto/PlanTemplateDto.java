package com.anes.server.ai.dto;

import java.util.List;

public record PlanTemplateDto(
        int dayNumber,
        String focusArea,
        Integer estimatedDurationMins,
        List<PlanExerciseDto> exercises
) {
}
