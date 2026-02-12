package com.anes.server.auth.service;

import com.anes.server.auth.entity.SecurityAuditLog;
import com.anes.server.auth.repository.SecurityAuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private SecurityAuditLogRepository repository;

    @Captor
    private ArgumentCaptor<SecurityAuditLog> logCaptor;

    private AuditLogService auditLogService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        auditLogService = new AuditLogService(repository, objectMapper);
    }

    @Test
    @DisplayName("logEvent persists AUTH_SUCCESS with all fields")
    void logAuthSuccess() {
        auditLogService.logEvent(
                AuditLogService.AUTH_SUCCESS, 42L, "192.168.1.1",
                "Mozilla/5.0", Map.of("provider", "firebase"));

        verify(repository).save(logCaptor.capture());
        SecurityAuditLog log = logCaptor.getValue();

        assertThat(log.getEventType()).isEqualTo("AUTH_SUCCESS");
        assertThat(log.getUserId()).isEqualTo(42L);
        assertThat(log.getIpAddress()).isEqualTo("192.168.1.1");
        assertThat(log.getUserAgent()).isEqualTo("Mozilla/5.0");
        assertThat(log.getDetails()).contains("firebase");
    }

    @Test
    @DisplayName("logEvent persists AUTH_FAILURE with null userId")
    void logAuthFailure() {
        auditLogService.logEvent(
                AuditLogService.AUTH_FAILURE, null, "10.0.0.1",
                "curl/7.68", Map.of("reason", "Token has expired"));

        verify(repository).save(logCaptor.capture());
        SecurityAuditLog log = logCaptor.getValue();

        assertThat(log.getEventType()).isEqualTo("AUTH_FAILURE");
        assertThat(log.getUserId()).isNull();
        assertThat(log.getDetails()).contains("Token has expired");
    }

    @Test
    @DisplayName("logEvent persists RATE_LIMIT_HIT")
    void logRateLimitHit() {
        auditLogService.logEvent(
                AuditLogService.RATE_LIMIT_HIT, null, "203.0.113.5",
                "bot/1.0", Map.of("endpoint", "/api/v1/auth/firebase", "count", 21));

        verify(repository).save(logCaptor.capture());
        SecurityAuditLog log = logCaptor.getValue();

        assertThat(log.getEventType()).isEqualTo("RATE_LIMIT_HIT");
        assertThat(log.getDetails()).contains("/api/v1/auth/firebase");
    }

    @Test
    @DisplayName("logEvent persists ACCOUNT_CREATED")
    void logAccountCreated() {
        auditLogService.logEvent(
                AuditLogService.ACCOUNT_CREATED, 1L, "172.16.0.1",
                "Chrome/120", Map.of("provider", "google.com"));

        verify(repository).save(logCaptor.capture());
        SecurityAuditLog log = logCaptor.getValue();

        assertThat(log.getEventType()).isEqualTo("ACCOUNT_CREATED");
        assertThat(log.getUserId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("logEvent handles null details gracefully")
    void logWithNullDetails() {
        auditLogService.logEvent(
                AuditLogService.AUTH_SUCCESS, 42L, "10.0.0.1", "Chrome/120");

        verify(repository).save(logCaptor.capture());
        SecurityAuditLog log = logCaptor.getValue();

        assertThat(log.getDetails()).isNull();
    }
}
