package com.anes.server.ai.dto;

import java.util.List;

public record GeminiResponse(
        List<Candidate> candidates,
        UsageMetadata usageMetadata
) {
    public record Candidate(Content content) {
    }

    public record Content(List<Part> parts) {
    }

    public record Part(String text) {
    }

    public record UsageMetadata(Integer promptTokenCount, Integer candidatesTokenCount, Integer totalTokenCount) {
    }
}
