package com.anes.server.auth.dto;

public record AuthUserDto(
        Long id,
        String email,
        String fullName,
        boolean onboardingComplete
) {
}
