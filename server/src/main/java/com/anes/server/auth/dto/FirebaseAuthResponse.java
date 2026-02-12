package com.anes.server.auth.dto;

/**
 * Response for Firebase token exchange.
 * Unlike legacy AuthResponse, no server-issued tokens are returned
 * because Firebase manages tokens client-side.
 */
public record FirebaseAuthResponse(
        AuthUserDto user
) {}
