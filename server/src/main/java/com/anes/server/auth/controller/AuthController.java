package com.anes.server.auth.controller;

import com.anes.server.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication endpoints: login, registration, token refresh.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, String>>> register(
            @RequestBody Map<String, String> request) {
        // TODO: Implement registration
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "message", "Registration endpoint — not yet implemented")));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(
            @RequestBody Map<String, String> request) {
        // TODO: Implement login
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "message", "Login endpoint — not yet implemented")));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, String>>> refresh(
            @RequestBody Map<String, String> request) {
        // TODO: Implement token refresh
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "message", "Token refresh endpoint — not yet implemented")));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "status", "UP", "service", "auth")));
    }
}
