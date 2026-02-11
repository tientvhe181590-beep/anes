package com.anes.server.auth.service;

import com.anes.server.auth.dto.AuthResponse;
import com.anes.server.auth.dto.AuthUserDto;
import com.anes.server.auth.dto.LoginRequest;
import com.anes.server.auth.dto.RegisterRequest;
import com.anes.server.auth.entity.RefreshToken;
import com.anes.server.auth.repository.RefreshTokenRepository;
import com.anes.server.common.exception.DuplicateResourceException;
import com.anes.server.user.entity.Role;
import com.anes.server.user.entity.User;
import com.anes.server.user.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final com.anes.server.config.JwtProperties jwtProperties;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            com.anes.server.config.JwtProperties jwtProperties
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailAndDeletedFalse(request.email())) {
            throw new DuplicateResourceException("User", "email", request.email());
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(Role.MEMBER);
        user.setOnboardingComplete(false);
        user.setPremium(false);

        User saved = userRepository.save(user);
        return issueTokens(saved);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(request.email())
                .orElseThrow(() -> new BadCredentialsException(
                        "Incorrect email or password. Please check again."));

        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Incorrect email or password. Please check again.");
        }

        return issueTokens(user);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setUser(user);
        refreshTokenEntity.setToken(refreshToken);
        refreshTokenEntity.setExpiresAt(LocalDateTime.now()
            .plusMillis(jwtProperties.refreshTokenExpiration()));
        refreshTokenRepository.save(refreshTokenEntity);

        AuthUserDto userDto = new AuthUserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.isOnboardingComplete()
        );

        return new AuthResponse(
                accessToken,
                refreshToken,
                jwtProperties.accessTokenExpiration() / 1000,
                userDto
        );
    }
}
