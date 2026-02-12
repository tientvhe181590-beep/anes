package com.anes.server.config;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.Map;

/**
 * Rate limit configuration properties.
 *
 * <pre>
 * anes:
 *   rate-limit:
 *     ip-limits:
 *       auth:
 *         max-requests: 20
 *         window-seconds: 900
 *         block-seconds: 900
 *       legacy-login:
 *         max-requests: 10
 *         window-seconds: 900
 *         block-seconds: 1800
 *       register:
 *         max-requests: 5
 *         window-seconds: 3600
 *         block-seconds: 3600
 *     user-limits:
 *       ai:
 *         max-requests: 10
 *         window-seconds: 60
 *         block-seconds: 60
 *       password-change:
 *         max-requests: 3
 *         window-seconds: 3600
 *         block-seconds: 3600
 *       sync-push:
 *         max-requests: 30
 *         window-seconds: 60
 *         block-seconds: 60
 * </pre>
 */
@Validated
@ConfigurationProperties(prefix = "anes.rate-limit")
public record RateLimitProperties(
        @NotNull Map<String, LimitConfig> ipLimits,
        @NotNull Map<String, LimitConfig> userLimits) {
    public record LimitConfig(
            @Positive int maxRequests,
            @Positive int windowSeconds,
            @Positive int blockSeconds) {
    }
}
