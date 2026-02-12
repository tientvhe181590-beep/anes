package com.anes.server.onboarding.controller;

import com.anes.server.common.dto.ApiResponse;
import com.anes.server.onboarding.dto.OnboardingRequest;
import com.anes.server.onboarding.service.OnboardingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/onboarding")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<Void>> complete(
            Authentication authentication,
            @Valid @RequestBody OnboardingRequest request
    ) {
        Long userId = extractUserId(authentication);
        onboardingService.completeOnboarding(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Onboarding completed."));
    }

    private Long extractUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long id) {
            return id;
        }
        return Long.parseLong(String.valueOf(principal));
    }
}
