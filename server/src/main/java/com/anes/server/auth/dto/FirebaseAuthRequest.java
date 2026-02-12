package com.anes.server.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record FirebaseAuthRequest(
        @NotBlank(message = "Firebase ID token is required") String idToken) {
}
