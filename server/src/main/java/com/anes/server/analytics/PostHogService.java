package com.anes.server.analytics;

import com.anes.server.config.PostHogProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;

/**
 * Fire-and-forget server-side event capture to PostHog.
 * <p>
 * When the API key is not configured or PostHog is unreachable the event is
 * logged locally and silently dropped — request processing is never blocked.
 */
@Service
@EnableConfigurationProperties(PostHogProperties.class)
public class PostHogService {

    private static final Logger log = LoggerFactory.getLogger(PostHogService.class);

    // Server-side event constants
    public static final String SERVER_RATE_LIMIT_HIT = "server_rate_limit_hit";
    public static final String SERVER_AUTH_FAILURE = "server_auth_failure";
    public static final String SERVER_SUSPICIOUS_ACTIVITY = "server_suspicious_activity";

    private final PostHogProperties properties;
    private final RestClient restClient;

    public PostHogService(PostHogProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClient = restClientBuilder.build();
    }

    /**
     * Capture an event asynchronously.  No-ops when PostHog is not configured.
     *
     * @param event      event name (snake_case)
     * @param distinctId distinct user/entity id (usually {@code "server"} for
     *                   server-side events)
     * @param props      event properties — must not contain PII such as raw IP
     */
    @Async
    public void capture(String event, String distinctId, Map<String, Object> props) {
        if (!properties.isEnabled()) {
            log.debug("PostHog not configured — dropping event '{}'", event);
            return;
        }

        Map<String, Object> body = new HashMap<>();
        body.put("api_key", properties.apiKey());
        body.put("event", event);
        body.put("distinct_id", distinctId);
        body.put("properties", props != null ? props : Map.of());

        try {
            restClient.post()
                    .uri(properties.host() + "/capture/")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();

            log.debug("PostHog event '{}' sent successfully", event);
        } catch (Exception ex) {
            // Fire-and-forget: log locally, never propagate
            log.warn("Failed to send PostHog event '{}': {}", event, ex.getMessage());
        }
    }

    // ---- convenience helpers ------------------------------------------------

    /**
     * Hash an IP address with SHA-256 so it can be sent as a non-PII property.
     */
    public static String hashIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return "unknown";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ip.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is guaranteed by the JLS — should never happen
            throw new AssertionError("SHA-256 not available", e);
        }
    }
}
