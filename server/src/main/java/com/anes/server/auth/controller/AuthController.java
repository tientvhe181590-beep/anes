package com.anes.server.auth.controller;

import com.anes.server.auth.dto.AuthResponse;
import com.anes.server.auth.dto.GoogleAuthRequest;
import com.anes.server.auth.dto.LoginRequest;
import com.anes.server.auth.dto.RefreshRequest;
import com.anes.server.auth.dto.RegisterRequest;
import com.anes.server.auth.service.AuthService;
import com.anes.server.common.dto.ApiResponse;
import jakarta.validation.Valid;
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

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Account created successfully."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful."));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> google(
            @Valid @RequestBody GoogleAuthRequest request
    ) {
        AuthResponse response = authService.googleAuth(request.idToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Google authentication successful."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshRequest request
    ) {
        AuthResponse response = authService.refreshTokens(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed."));
    }
}
