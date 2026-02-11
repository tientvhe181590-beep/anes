package com.anes.server.dashboard.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnDashboardSummary() throws Exception {
        mockMvc.perform(get("/api/v1/user/dashboard-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.streakDays").value(5))
                .andExpect(jsonPath("$.calorieInfo.consumed").value(1200))
                .andExpect(jsonPath("$.workoutInfo.title").value("Leg Day"));
    }
}
