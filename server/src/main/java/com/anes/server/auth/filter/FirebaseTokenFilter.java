package com.anes.server.auth.filter;

import com.anes.server.auth.entity.AuthIdentity;
import com.anes.server.auth.repository.AuthIdentityRepository;
import com.anes.server.auth.service.AuditLogService;
import com.anes.server.auth.service.FirebaseAuthService;
import com.anes.server.auth.util.CloudflareIpResolver;
import com.anes.server.common.dto.ApiResponse;
import com.anes.server.user.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@ConditionalOnProperty(name = "anes.firebase.enabled", havingValue = "true")
public class FirebaseTokenFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(FirebaseTokenFilter.class);

    private static final List<String> WHITELIST = List.of(
            "/api/v1/auth/**",
            "/actuator/health");

    private final FirebaseAuthService firebaseAuthService;
    private final AuthIdentityRepository authIdentityRepository;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public FirebaseTokenFilter(
            FirebaseAuthService firebaseAuthService,
            AuthIdentityRepository authIdentityRepository,
            AuditLogService auditLogService,
            ObjectMapper objectMapper) {
        this.firebaseAuthService = firebaseAuthService;
        this.authIdentityRepository = authIdentityRepository;
        this.auditLogService = auditLogService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return WHITELIST.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            writeUnauthorized(response, "Authentication required.");
            return;
        }

        String idToken = authHeader.substring(7);

        try {
            FirebaseToken decodedToken = firebaseAuthService.verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            // Look up the internal user via auth_identities
            AuthIdentity identity = authIdentityRepository
                    .findByProviderAndProviderUid("firebase", uid)
                    .orElse(null);

            if (identity == null) {
                // Also try provider-specific UID (e.g. "google.com")
                String provider = firebaseAuthService.extractProvider(decodedToken);
                identity = authIdentityRepository
                        .findByProviderAndProviderUid(provider, uid)
                        .orElse(null);
            }

            if (identity == null) {
                writeUnauthorized(response, "User not found. Please complete authentication first.");
                return;
            }

            User user = identity.getUser();

            if (user.isDeleted()) {
                writeUnauthorized(response, "User account has been deactivated.");
                return;
            }

            // Set Spring Security context with user ID and role authorities
            List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(user.getId(),
                    null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            filterChain.doFilter(request, response);
        } catch (org.springframework.security.authentication.BadCredentialsException ex) {
            String clientIp = CloudflareIpResolver.resolve(request);
            auditLogService.logEvent(AuditLogService.AUTH_FAILURE, null, clientIp,
                    request.getHeader("User-Agent"),
                    java.util.Map.of("reason", ex.getMessage()));
            writeUnauthorized(response, ex.getMessage());
        }
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        ApiResponse<Void> body = ApiResponse.error("UNAUTHORIZED", message);
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
