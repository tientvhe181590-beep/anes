package com.anes.server.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "anes.ai")
public record AiProperties(
        @NotBlank String provider,
        @NotBlank String model,
        @NotBlank String apiKey,
        @NotNull Double temperature,
        @Positive int maxOutputTokens,
        @Valid RateLimit rateLimit
) {
    public record RateLimit(
            @Positive int freeTier,
            @Positive int premiumTier
    ) {
    }
}
