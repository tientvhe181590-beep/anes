package com.anes.server.auth.filter;

import com.anes.server.auth.service.AuditLogService;
import com.anes.server.auth.service.RateLimitService;
import com.anes.server.config.RateLimitProperties;
import com.anes.server.config.RateLimitProperties.LimitConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RateLimitFilterTest {

    @Mock
    private RateLimitService rateLimitService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private FilterChain filterChain;

    private RateLimitFilter filter;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @BeforeEach
    void setUp() {
        RateLimitProperties props = new RateLimitProperties(
                Map.of("auth", new LimitConfig(20, 900, 900),
                        "legacy-login", new LimitConfig(10, 900, 1800)),
                Map.of("ai", new LimitConfig(10, 60, 60)));
        filter = new RateLimitFilter(rateLimitService, props, auditLogService, objectMapper);
    }

    @Test
    @DisplayName("GET requests are always allowed through")
    void getRequestsPassThrough() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/firebase");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    @DisplayName("OPTIONS requests are always allowed through")
    void optionsRequestsPassThrough() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/v1/auth/firebase");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("POST within IP rate limit passes through")
    void withinLimitPasses() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/firebase");
        request.setRemoteAddr("192.168.1.1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(rateLimitService.getBlockSecondsRemaining("ip", "192.168.1.1")).thenReturn(0L);
        when(rateLimitService.incrementCounter("ip", "192.168.1.1", "auth", 900)).thenReturn(5L);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    @DisplayName("POST exceeding IP rate limit returns 429")
    void exceedingLimitReturns429() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/firebase");
        request.setRemoteAddr("192.168.1.1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(rateLimitService.getBlockSecondsRemaining("ip", "192.168.1.1")).thenReturn(0L);
        when(rateLimitService.incrementCounter("ip", "192.168.1.1", "auth", 900)).thenReturn(21L);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getHeader("Retry-After")).isEqualTo("900");
        verify(rateLimitService).createBlock(eq("ip"), eq("192.168.1.1"), eq(900), anyString());
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    @DisplayName("Blocked IP returns 429 immediately without incrementing")
    void blockedIpReturns429() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/firebase");
        request.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(rateLimitService.getBlockSecondsRemaining("ip", "10.0.0.1")).thenReturn(600L);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getHeader("Retry-After")).isEqualTo("600");
        verify(rateLimitService, never()).incrementCounter(anyString(), anyString(), anyString(), anyInt());
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    @DisplayName("POST to non-rate-limited path passes through")
    void nonRateLimitedPathPasses() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/workouts");
        request.setRemoteAddr("192.168.1.1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(rateLimitService, never()).incrementCounter(anyString(), anyString(), anyString(), anyInt());
    }

    @Test
    @DisplayName("Rate limit audit event is logged on limit exceeded")
    void logsAuditEventOnExceed() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/firebase");
        request.setRemoteAddr("192.168.1.1");
        request.addHeader("User-Agent", "test-agent");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(rateLimitService.getBlockSecondsRemaining("ip", "192.168.1.1")).thenReturn(0L);
        when(rateLimitService.incrementCounter("ip", "192.168.1.1", "auth", 900)).thenReturn(21L);

        filter.doFilterInternal(request, response, filterChain);

        verify(auditLogService).logEvent(
                eq(AuditLogService.RATE_LIMIT_HIT), any(), eq("192.168.1.1"),
                eq("test-agent"), any(Map.class));
    }
}
