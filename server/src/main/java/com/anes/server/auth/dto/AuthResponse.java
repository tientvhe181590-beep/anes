package com.anes.server.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserInfo user) {
    public record UserInfo(
            String id,
            String email,
            String fullName,
            String role,
            String membershipTier) {
    }
}
