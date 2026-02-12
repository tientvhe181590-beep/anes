package com.anes.server.auth.controller;

import com.anes.server.auth.service.AuthService;
import com.anes.server.common.exception.GlobalExceptionHandler;
import com.anes.server.config.FirebaseProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("Legacy Auth Endpoints — HTTP 410 when Firebase enabled")
class LegacyAuthDeprecationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private FirebaseProperties firebaseProperties;

    @BeforeEach
    void setUp() {
        when(firebaseProperties.enabled()).thenReturn(true);
    }

    @Test
    @DisplayName("POST /auth/login returns 410 GONE when Firebase enabled")
    void login_returns410_whenFirebaseEnabled() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user@example.com\",\"password\":\"Password123\"}"))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.error").value("GONE"))
                .andExpect(jsonPath("$.message").value("Legacy auth is deprecated. Use Firebase authentication."));

        verify(authService, never()).login(any());
    }

    @Test
    @DisplayName("POST /auth/register returns 410 GONE when Firebase enabled")
    void register_returns410_whenFirebaseEnabled() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user@example.com\",\"password\":\"Password123\",\"fullName\":\"User\"}"))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.error").value("GONE"))
                .andExpect(jsonPath("$.message").value("Legacy auth is deprecated. Use Firebase authentication."));

        verify(authService, never()).register(any());
    }

    @Test
    @DisplayName("POST /auth/refresh returns 410 GONE when Firebase enabled")
    void refresh_returns410_whenFirebaseEnabled() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"some-refresh-token\"}"))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.error").value("GONE"))
                .andExpect(jsonPath("$.message").value("Legacy auth is deprecated. Use Firebase authentication."));

        verify(authService, never()).refreshTokens(any());
    }

    @Test
    @DisplayName("POST /auth/google is NOT deprecated (works regardless of Firebase flag)")
    void google_isNotDeprecated_whenFirebaseEnabled() throws Exception {
        // Google endpoint has no deprecation guard — it should still produce
        // a validation error (empty body) instead of 410
        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }
}
