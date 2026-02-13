package com.anes.server.auth.service;

import com.anes.server.analytics.PostHogService;
import com.anes.server.auth.entity.SecurityAuditLog;
import com.anes.server.auth.repository.SecurityAuditLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Logs security-relevant events to the {@code security_audit_logs} table.
 * All log methods are async to avoid blocking request processing.
 * <p>
 * Events that are relevant for analytics are also forwarded to PostHog via
 * {@link PostHogService} (fire-and-forget).
 */
@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    // Event type constants
    public static final String AUTH_SUCCESS = "AUTH_SUCCESS";
    public static final String AUTH_FAILURE = "AUTH_FAILURE";
    public static final String RATE_LIMIT_HIT = "RATE_LIMIT_HIT";
    public static final String TOKEN_REVOKED = "TOKEN_REVOKED";
    public static final String ACCOUNT_CREATED = "ACCOUNT_CREATED";
    public static final String ACCOUNT_LINKED = "ACCOUNT_LINKED";
    public static final String SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY";

    /** Audit event types that should also be forwarded to PostHog. */
    private static final Set<String> POSTHOG_FORWARDED = Set.of(
            AUTH_FAILURE, RATE_LIMIT_HIT, SUSPICIOUS_ACTIVITY);

    /** Maps internal audit event type → PostHog event name. */
    private static final Map<String, String> POSTHOG_EVENT_NAMES = Map.of(
            AUTH_FAILURE, PostHogService.SERVER_AUTH_FAILURE,
            RATE_LIMIT_HIT, PostHogService.SERVER_RATE_LIMIT_HIT,
            SUSPICIOUS_ACTIVITY, PostHogService.SERVER_SUSPICIOUS_ACTIVITY);

    private final SecurityAuditLogRepository repository;
    private final ObjectMapper objectMapper;
    private final PostHogService postHogService;

    public AuditLogService(SecurityAuditLogRepository repository,
                           ObjectMapper objectMapper,
                           PostHogService postHogService) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.postHogService = postHogService;
    }

    /**
     * Log a security event asynchronously.
     */
    @Async
    public void logEvent(String eventType, Long userId, String ipAddress, String userAgent,
            Map<String, Object> details) {
        try {
            String detailsJson = details != null ? objectMapper.writeValueAsString(details) : null;
            SecurityAuditLog entry = new SecurityAuditLog(eventType, userId, ipAddress, userAgent, detailsJson);
            repository.save(entry);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize audit log details for event {}", eventType, e);
        } catch (Exception e) {
            log.error("Failed to persist audit log for event {}", eventType, e);
        }

        // Forward security-relevant events to PostHog (fire-and-forget)
        forwardToPostHog(eventType, ipAddress, details);
    }

    /**
     * Convenience: log event without details map.
     */
    @Async
    public void logEvent(String eventType, Long userId, String ipAddress, String userAgent) {
        logEvent(eventType, userId, ipAddress, userAgent, null);
    }

    // ------------------------------------------------------------------ private

    private void forwardToPostHog(String eventType, String ipAddress, Map<String, Object> details) {
        if (!POSTHOG_FORWARDED.contains(eventType)) {
            return;
        }

        String posthogEvent = POSTHOG_EVENT_NAMES.get(eventType);
        Map<String, Object> props = new HashMap<>();
        props.put("ip_hash", PostHogService.hashIp(ipAddress));

        if (details != null) {
            // Include safe properties (endpoint, category, reason, type, etc.)
            details.forEach((key, value) -> {
                if (value != null) {
                    props.put(key, value);
                }
            });
        }

        postHogService.capture(posthogEvent, "server", props);
    }
}
