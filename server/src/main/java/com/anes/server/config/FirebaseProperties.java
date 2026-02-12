package com.anes.server.config;

import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "anes.firebase")
public record FirebaseProperties(
        @NotNull Boolean enabled,
        String serviceAccountPath) {
    public FirebaseProperties {
        if (enabled == null) {
            enabled = false;
        }
    }
}
