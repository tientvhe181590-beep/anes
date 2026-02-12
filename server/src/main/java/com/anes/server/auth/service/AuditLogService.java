package com.anes.server.auth.service;

import com.anes.server.auth.entity.SecurityAuditLog;
import com.anes.server.auth.repository.SecurityAuditLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Logs security-relevant events to the {@code security_audit_logs} table.
 * All log methods are async to avoid blocking request processing.
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

    private final SecurityAuditLogRepository repository;
    private final ObjectMapper objectMapper;

    public AuditLogService(SecurityAuditLogRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
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
    }

    /**
     * Convenience: log event without details map.
     */
    @Async
    public void logEvent(String eventType, Long userId, String ipAddress, String userAgent) {
        logEvent(eventType, userId, ipAddress, userAgent, null);
    }
}
