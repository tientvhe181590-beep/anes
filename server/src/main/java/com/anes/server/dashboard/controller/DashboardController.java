package com.anes.server.dashboard.controller;

import com.anes.server.common.dto.ApiResponse;
import com.anes.server.dashboard.dto.DashboardSummaryResponse;
import com.anes.server.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> summary(Authentication authentication) {
        Long userId = extractUserId(authentication);
        DashboardSummaryResponse response = dashboardService.getSummary(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Dashboard loaded."));
    }

    private Long extractUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long id) {
            return id;
        }
        return Long.parseLong(String.valueOf(principal));
    }
}
