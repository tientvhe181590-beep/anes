package com.anes.server.ai.service;

import com.anes.server.ai.repository.AiUsageLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class AiUsageWindowService {

    private final AiUsageLogRepository aiUsageLogRepository;

    public AiUsageWindowService(AiUsageLogRepository aiUsageLogRepository) {
        this.aiUsageLogRepository = aiUsageLogRepository;
    }

    public boolean hasGeneratedPlanToday(Long userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return aiUsageLogRepository.countByUserIdAndEndpointSince(userId, "generate-plan", startOfDay) > 0;
    }
}
