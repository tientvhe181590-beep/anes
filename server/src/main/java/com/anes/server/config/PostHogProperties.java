package com.anes.server.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "anes.posthog")
public record PostHogProperties(
        String apiKey,
        String host) {

    /**
     * Returns {@code true} when a non-blank API key is configured.
     */
    public boolean isEnabled() {
        return apiKey != null && !apiKey.isBlank();
    }
}
