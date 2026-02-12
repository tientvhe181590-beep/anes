package com.anes.server.auth.controller;

import com.anes.server.auth.dto.AuthResponse;
import com.anes.server.auth.dto.AuthUserDto;
import com.anes.server.auth.service.AuthService;
import com.anes.server.common.exception.GlobalExceptionHandler;
import com.anes.server.config.FirebaseProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private FirebaseProperties firebaseProperties;

    @BeforeEach
    void setUp() {
        org.mockito.Mockito.when(firebaseProperties.enabled()).thenReturn(false);
    }

    @Test
    void registerReturnsCreated() throws Exception {
        AuthResponse response = new AuthResponse(
                "access",
                "refresh",
                3600,
                new AuthUserDto(1L, "user@example.com", "User", false));
        when(authService.register(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                        "\"email\":\"user@example.com\"," +
                        "\"password\":\"Password123\"," +
                        "\"fullName\":\"User\"" +
                        "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.accessToken").value("access"))
                .andExpect(jsonPath("$.message").value("Account created successfully."));
    }

    @Test
    void registerValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    void loginReturnsOk() throws Exception {
        AuthResponse response = new AuthResponse(
                "access",
                "refresh",
                3600,
                new AuthUserDto(1L, "user@example.com", "User", false));
        when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                        "\"email\":\"user@example.com\"," +
                        "\"password\":\"Password123\"" +
                        "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("access"))
                .andExpect(jsonPath("$.message").value("Login successful."));
    }

    @Test
    void loginValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    void googleReturnsGone() throws Exception {
        mockMvc.perform(post("/api/v1/auth/google")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                        "\"idToken\":\"token\"" +
                        "}"))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.error").value("GONE"));
    }

    @Test
    void refreshReturnsOk() throws Exception {
        AuthResponse response = new AuthResponse(
                "access",
                "refresh",
                3600,
                null);
        when(authService.refreshTokens(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                        "\"refreshToken\":\"refresh\"" +
                        "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("access"))
                .andExpect(jsonPath("$.message").value("Token refreshed."));
    }

    @Test
    void refreshValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }
}
