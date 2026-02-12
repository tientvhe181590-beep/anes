package com.anes.server.auth.controller;

import com.anes.server.auth.dto.AuthUserDto;
import com.anes.server.auth.dto.FirebaseAuthResponse;
import com.anes.server.auth.service.AuditLogService;
import com.anes.server.auth.service.AuthService;
import com.anes.server.auth.service.FirebaseTokenExchangeService;
import com.anes.server.auth.filter.PayloadSizeFilter;
import com.anes.server.auth.filter.RateLimitFilter;
import com.anes.server.common.exception.GlobalExceptionHandler;
import com.anes.server.config.FirebaseProperties;
import org.springframework.web.cors.CorsConfigurationSource;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class FirebaseAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private FirebaseProperties firebaseProperties;

    @MockitoBean
    private FirebaseTokenExchangeService firebaseTokenExchangeService;

    @MockitoBean
    private AuditLogService auditLogService;

    // SecurityConfig dependencies (not used with addFilters=false but needed for
    // context)
    @MockitoBean
    private com.anes.server.auth.filter.JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private RateLimitFilter rateLimitFilter;

    @MockitoBean
    private PayloadSizeFilter payloadSizeFilter;

    @MockitoBean
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    @DisplayName("POST /api/v1/auth/firebase: new user returns 201")
    void firebaseAuth_newUser_returnsCreated() throws Exception {
        FirebaseAuthResponse response = new FirebaseAuthResponse(
                new AuthUserDto(1L, "new@example.com", "New User", false));
        FirebaseTokenExchangeService.ExchangeResult result = new FirebaseTokenExchangeService.ExchangeResult(response,
                true);

        when(firebaseTokenExchangeService.exchangeToken(anyString())).thenReturn(result);

        mockMvc.perform(post("/api/v1/auth/firebase")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"idToken\":\"valid-firebase-token\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.user.id").value(1))
                .andExpect(jsonPath("$.data.user.email").value("new@example.com"))
                .andExpect(jsonPath("$.data.user.fullName").value("New User"))
                .andExpect(jsonPath("$.data.user.onboardingComplete").value(false))
                .andExpect(jsonPath("$.message").value("Account created successfully."));
    }

    @Test
    @DisplayName("POST /api/v1/auth/firebase: existing user returns 200")
    void firebaseAuth_existingUser_returnsOk() throws Exception {
        FirebaseAuthResponse response = new FirebaseAuthResponse(
                new AuthUserDto(5L, "existing@example.com", "Existing User", true));
        FirebaseTokenExchangeService.ExchangeResult result = new FirebaseTokenExchangeService.ExchangeResult(response,
                false);

        when(firebaseTokenExchangeService.exchangeToken(anyString())).thenReturn(result);

        mockMvc.perform(post("/api/v1/auth/firebase")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"idToken\":\"valid-firebase-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.id").value(5))
                .andExpect(jsonPath("$.data.user.email").value("existing@example.com"))
                .andExpect(jsonPath("$.message").value("Authentication successful."));
    }

    @Test
    @DisplayName("POST /api/v1/auth/firebase: invalid token returns 401")
    void firebaseAuth_invalidToken_returnsUnauthorized() throws Exception {
        when(firebaseTokenExchangeService.exchangeToken(anyString()))
                .thenThrow(new BadCredentialsException("Invalid authentication token"));

        mockMvc.perform(post("/api/v1/auth/firebase")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"idToken\":\"invalid-token\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/firebase: missing idToken returns 422")
    void firebaseAuth_missingIdToken_returnsValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/auth/firebase")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }
}
