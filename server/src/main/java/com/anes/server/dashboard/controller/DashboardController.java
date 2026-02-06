package com.anes.server.dashboard.controller;

import com.anes.server.dashboard.dto.DashboardSummaryDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user/dashboard-summary")
public class DashboardController {

    @GetMapping
    public DashboardSummaryDTO getDashboardSummary() {
        // Mock data for now as per plan integration step
        // In real impl, this would aggregate data from services
        return new DashboardSummaryDTO(
                5,
                new DashboardSummaryDTO.CalorieInfo(1200, 2000),
                new DashboardSummaryDTO.WorkoutInfo("1", "Leg Day", 45, "High"));
    }
}
