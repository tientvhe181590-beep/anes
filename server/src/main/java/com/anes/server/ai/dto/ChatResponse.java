package com.anes.server.ai.dto;

public record ChatResponse(
        String reply,
        int tokensUsed
) {
}
