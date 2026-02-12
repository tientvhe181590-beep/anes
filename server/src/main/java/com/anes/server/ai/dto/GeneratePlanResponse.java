package com.anes.server.ai.dto;

import java.util.List;

public record GeneratePlanResponse(
        Long programId,
        String programName,
        Integer durationWeeks,
        List<PlanTemplateDto> templates
) {
}
