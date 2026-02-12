package com.anes.server.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,
        AuthUserDto user
) {
}
