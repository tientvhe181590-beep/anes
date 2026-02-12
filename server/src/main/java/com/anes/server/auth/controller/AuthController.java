package com.anes.server.auth.controller;

import com.anes.server.auth.dto.AuthResponse;
import com.anes.server.auth.dto.FirebaseAuthRequest;
import com.anes.server.auth.dto.FirebaseAuthResponse;
import com.anes.server.auth.dto.LoginRequest;
import com.anes.server.auth.dto.RefreshRequest;
import com.anes.server.auth.dto.RegisterRequest;
import com.anes.server.auth.service.AuditLogService;
import com.anes.server.auth.service.AuthService;
import com.anes.server.auth.service.FirebaseTokenExchangeService;
import com.anes.server.auth.util.CloudflareIpResolver;
import com.anes.server.common.dto.ApiResponse;
import com.anes.server.config.FirebaseProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final FirebaseProperties firebaseProperties;
    private final AuditLogService auditLogService;

    // Optional — only present when anes.firebase.enabled=true
    @Autowired(required = false)
    private FirebaseTokenExchangeService firebaseTokenExchangeService;

    public AuthController(AuthService authService, FirebaseProperties firebaseProperties,
            AuditLogService auditLogService) {
        this.authService = authService;
        this.firebaseProperties = firebaseProperties;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/firebase")
    public ResponseEntity<ApiResponse<FirebaseAuthResponse>> firebaseAuth(
            @Valid @RequestBody FirebaseAuthRequest request,
            HttpServletRequest httpRequest) {
        if (firebaseTokenExchangeService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("SERVICE_UNAVAILABLE", "Firebase authentication is not enabled."));
        }

        String clientIp = CloudflareIpResolver.resolve(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        FirebaseTokenExchangeService.ExchangeResult result = firebaseTokenExchangeService
                .exchangeToken(request.idToken());

        Long userId = result.response().user().id();

        if (result.newUser()) {
            auditLogService.logEvent(AuditLogService.ACCOUNT_CREATED, userId, clientIp, userAgent,
                    java.util.Map.of("provider", "firebase"));
        } else {
            auditLogService.logEvent(AuditLogService.AUTH_SUCCESS, userId, clientIp, userAgent,
                    java.util.Map.of("provider", "firebase"));
        }

        HttpStatus status = result.newUser() ? HttpStatus.CREATED : HttpStatus.OK;
        String message = result.newUser() ? "Account created successfully." : "Authentication successful.";

        return ResponseEntity.status(status)
                .body(ApiResponse.success(result.response(), message));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        if (isFirebaseEnabled()) {
            return legacyDeprecatedResponse();
        }
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Account created successfully."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        if (isFirebaseEnabled()) {
            return legacyDeprecatedResponse();
        }
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful."));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> google() {
        return legacyDeprecatedResponse();
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshRequest request) {
        if (isFirebaseEnabled()) {
            return legacyDeprecatedResponse();
        }
        AuthResponse response = authService.refreshTokens(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed."));
    }

    private boolean isFirebaseEnabled() {
        return firebaseProperties.enabled();
    }

    @SuppressWarnings("unchecked")
    private <T> ResponseEntity<ApiResponse<T>> legacyDeprecatedResponse() {
        return ResponseEntity.status(HttpStatus.GONE)
                .body((ApiResponse<T>) ApiResponse.error(
                        "GONE",
                        "Legacy auth is deprecated. Use Firebase authentication."));
    }
}
