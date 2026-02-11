package com.anes.server.auth.service;

import com.anes.server.auth.dto.*;
import com.anes.server.auth.entity.RefreshTokenEntity;
import com.anes.server.auth.repository.RefreshTokenRepository;
import com.anes.server.user.entity.UserEntity;
import com.anes.server.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailAndDeletedFalse(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        var user = new UserEntity();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(request.email().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        userRepository.save(user);

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        var user = userRepository.findByEmailAndDeletedFalse(request.email().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("Incorrect email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect email or password");
        }

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        var storedToken = refreshTokenRepository
                .findByTokenAndRevokedFalseAndDeletedFalse(request.refreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (storedToken.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Refresh token expired");
        }

        // Validate JWT signature
        jwtService.parseToken(request.refreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token signature"));

        var user = storedToken.getUser();

        // Revoke old token
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        return generateAuthResponse(user);
    }

    private AuthResponse generateAuthResponse(UserEntity user) {
        var accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        var refreshTokenStr = jwtService.generateRefreshToken(user.getId());

        // Persist refresh token
        var refreshToken = new RefreshTokenEntity();
        refreshToken.setId(UUID.randomUUID().toString());
        refreshToken.setUser(user);
        refreshToken.setToken(refreshTokenStr);
        refreshToken.setExpiresAt(Instant.now().plusMillis(jwtService.getRefreshTokenExpiryMs()));
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshTokenStr,
                new AuthResponse.UserInfo(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getRole(),
                        user.getMembershipTier()));
    }
}
