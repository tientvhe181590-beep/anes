package com.anes.server.auth.filter;

import com.anes.server.auth.service.AuditLogService;
import com.anes.server.auth.service.RateLimitService;
import com.anes.server.auth.util.CloudflareIpResolver;
import com.anes.server.common.dto.ApiResponse;
import com.anes.server.config.RateLimitProperties;
import com.anes.server.config.RateLimitProperties.LimitConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Servlet filter enforcing per-IP and per-user rate limits.
 * Checks for existing blocks first, then increments counters.
 * Returns HTTP 429 with {@code Retry-After} header on limit violation.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private final RateLimitService rateLimitService;
    private final RateLimitProperties rateLimitProperties;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    // Endpoint → IP limit category mapping
    private static final Map<String, String> IP_LIMIT_ROUTES = new LinkedHashMap<>();
    static {
        IP_LIMIT_ROUTES.put("/api/v1/auth/firebase", "auth");
        IP_LIMIT_ROUTES.put("/api/v1/auth/login", "legacy-login");
        IP_LIMIT_ROUTES.put("/api/v1/auth/register", "legacy-login");
    }

    // Endpoint → user limit category mapping
    private static final Map<String, String> USER_LIMIT_ROUTES = new LinkedHashMap<>();
    static {
        USER_LIMIT_ROUTES.put("/api/v1/ai/**", "ai");
        USER_LIMIT_ROUTES.put("/api/v1/users/*/password", "password-change");
        USER_LIMIT_ROUTES.put("/api/v1/sync/push", "sync-push");
    }

    public RateLimitFilter(
            RateLimitService rateLimitService,
            RateLimitProperties rateLimitProperties,
            AuditLogService auditLogService,
            ObjectMapper objectMapper) {
        this.rateLimitService = rateLimitService;
        this.rateLimitProperties = rateLimitProperties;
        this.auditLogService = auditLogService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = CloudflareIpResolver.resolve(request);

        // Only rate-limit POST/PUT/PATCH (not GET/OPTIONS)
        if ("GET".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // ── IP-based rate limiting ───────────────────────────────────
        String ipCategory = resolveCategory(path, IP_LIMIT_ROUTES);
        if (ipCategory != null) {
            LimitConfig config = rateLimitProperties.ipLimits().get(ipCategory);
            if (config != null) {
                // Check block first
                long blocked = rateLimitService.getBlockSecondsRemaining("ip", clientIp);
                if (blocked > 0) {
                    writeTooManyRequests(response, blocked);
                    return;
                }

                long count = rateLimitService.incrementCounter("ip", clientIp, ipCategory, config.windowSeconds());
                if (count > config.maxRequests()) {
                    rateLimitService.createBlock("ip", clientIp, config.blockSeconds(),
                            "Exceeded " + ipCategory + " rate limit");
                    auditLogService.logEvent(
                            AuditLogService.RATE_LIMIT_HIT, null, clientIp,
                            request.getHeader("User-Agent"),
                            Map.of("endpoint", path, "category", ipCategory, "count", count));
                    writeTooManyRequests(response, config.blockSeconds());
                    return;
                }
            }
        }

        // ── User-based rate limiting ─────────────────────────────────
        String userCategory = resolveCategory(path, USER_LIMIT_ROUTES);
        if (userCategory != null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof Long userId) {
                LimitConfig config = rateLimitProperties.userLimits().get(userCategory);
                if (config != null) {
                    long blocked = rateLimitService.getBlockSecondsRemaining("user", String.valueOf(userId));
                    if (blocked > 0) {
                        writeTooManyRequests(response, blocked);
                        return;
                    }

                    long count = rateLimitService.incrementCounter(
                            "user", String.valueOf(userId), userCategory, config.windowSeconds());
                    if (count > config.maxRequests()) {
                        rateLimitService.createBlock("user", String.valueOf(userId),
                                config.blockSeconds(), "Exceeded " + userCategory + " rate limit");
                        auditLogService.logEvent(
                                AuditLogService.RATE_LIMIT_HIT, userId, clientIp,
                                request.getHeader("User-Agent"),
                                Map.of("endpoint", path, "category", userCategory, "count", count));
                        writeTooManyRequests(response, config.blockSeconds());
                        return;
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveCategory(String path, Map<String, String> routes) {
        for (var entry : routes.entrySet()) {
            if (pathMatcher.match(entry.getKey(), path)) {
                return entry.getValue();
            }
        }
        return null;
    }

    private void writeTooManyRequests(HttpServletResponse response, long retryAfterSeconds)
            throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSeconds));

        ApiResponse<Void> body = ApiResponse.error("RATE_LIMITED",
                "Too many requests. Please try again later.");
        objectMapper.writeValue(response.getWriter(), body);
    }
}
