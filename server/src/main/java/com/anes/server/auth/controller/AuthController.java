package com.anes.server.auth.controller;

import com.anes.server.auth.dto.AuthResponse;
import com.anes.server.auth.dto.LoginRequest;
import com.anes.server.auth.dto.RefreshRequest;
import com.anes.server.auth.dto.RegisterRequest;
import com.anes.server.auth.service.AuthService;
import com.anes.server.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication endpoints: login, registration, token refresh.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        var response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        var response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshRequest request) {
        var response = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "status", "UP", "service", "auth")));
    }
}
