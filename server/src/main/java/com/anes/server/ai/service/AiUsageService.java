package com.anes.server.ai.service;

import com.anes.server.ai.entity.AiUsageLog;
import com.anes.server.ai.repository.AiUsageLogRepository;
import com.anes.server.user.entity.User;
import org.springframework.stereotype.Service;

@Service
public class AiUsageService {

    private final AiUsageLogRepository aiUsageLogRepository;

    public AiUsageService(AiUsageLogRepository aiUsageLogRepository) {
        this.aiUsageLogRepository = aiUsageLogRepository;
    }

    public void logUsage(User user, String endpoint, int inputTokens, int outputTokens) {
        AiUsageLog log = new AiUsageLog();
        log.setUser(user);
        log.setEndpoint(endpoint);
        log.setInputTokens(inputTokens);
        log.setOutputTokens(outputTokens);
        aiUsageLogRepository.save(log);
    }
}
