package com.anes.server.auth.filter;

import com.anes.server.common.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Rejects requests whose {@code Content-Length} exceeds per-endpoint
 * thresholds.
 * Returns HTTP 413 (Payload Too Large).
 */
@Component
public class PayloadSizeFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    /** Pattern → max bytes. Checked in order; first match wins. */
    private static final Map<String, Long> SIZE_LIMITS = new LinkedHashMap<>();
    static {
        SIZE_LIMITS.put("/api/v1/auth/**", 10L * 1024); // 10 KB
        SIZE_LIMITS.put("/api/v1/sync/push", 1L * 1024 * 1024); // 1 MB
        SIZE_LIMITS.put("/api/v1/ai/**", 50L * 1024); // 50 KB
    }

    private static final long DEFAULT_LIMIT = 100L * 1024; // 100 KB

    public PayloadSizeFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        long contentLength = request.getContentLengthLong();
        // If Content-Length not set or negative, let Spring handle it downstream
        if (contentLength <= 0) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        long maxBytes = resolveLimit(path);

        if (contentLength > maxBytes) {
            response.setStatus(HttpStatus.PAYLOAD_TOO_LARGE.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ApiResponse<Void> body = ApiResponse.error("PAYLOAD_TOO_LARGE",
                    "Request body exceeds the maximum allowed size of " + maxBytes + " bytes.");
            objectMapper.writeValue(response.getWriter(), body);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private long resolveLimit(String path) {
        for (var entry : SIZE_LIMITS.entrySet()) {
            if (pathMatcher.match(entry.getKey(), path)) {
                return entry.getValue();
            }
        }
        return DEFAULT_LIMIT;
    }
}
