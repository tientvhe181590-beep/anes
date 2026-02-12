package com.anes.server.auth.controller;

import com.anes.server.auth.dto.AuthResponse;
import com.anes.server.auth.dto.FirebaseAuthRequest;
import com.anes.server.auth.dto.FirebaseAuthResponse;
import com.anes.server.auth.dto.GoogleAuthRequest;
import com.anes.server.auth.dto.LoginRequest;
import com.anes.server.auth.dto.RefreshRequest;
import com.anes.server.auth.dto.RegisterRequest;
import com.anes.server.auth.service.AuthService;
import com.anes.server.auth.service.FirebaseTokenExchangeService;
import com.anes.server.common.dto.ApiResponse;
import com.anes.server.config.FirebaseProperties;
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

    // Optional — only present when anes.firebase.enabled=true
    @Autowired(required = false)
    private FirebaseTokenExchangeService firebaseTokenExchangeService;

    public AuthController(AuthService authService, FirebaseProperties firebaseProperties) {
        this.authService = authService;
        this.firebaseProperties = firebaseProperties;
    }

    @PostMapping("/firebase")
    public ResponseEntity<ApiResponse<FirebaseAuthResponse>> firebaseAuth(
            @Valid @RequestBody FirebaseAuthRequest request) {
        if (firebaseTokenExchangeService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("SERVICE_UNAVAILABLE", "Firebase authentication is not enabled."));
        }

        FirebaseTokenExchangeService.ExchangeResult result = firebaseTokenExchangeService
                .exchangeToken(request.idToken());

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
    public ResponseEntity<ApiResponse<AuthResponse>> google(
            @Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse response = authService.googleAuth(request.idToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Google authentication successful."));
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
