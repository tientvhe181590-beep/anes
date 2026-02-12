package com.anes.server.auth.service;

import com.anes.server.auth.dto.AuthResponse;
import com.anes.server.auth.dto.LoginRequest;
import com.anes.server.auth.dto.RegisterRequest;
import com.anes.server.auth.entity.RefreshToken;
import com.anes.server.auth.repository.RefreshTokenRepository;
import com.anes.server.config.JwtProperties;
import com.anes.server.user.entity.Role;
import com.anes.server.user.entity.User;
import com.anes.server.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

        @Mock
        private UserRepository userRepository;

        @Mock
        private RefreshTokenRepository refreshTokenRepository;

        @Mock
        private PasswordEncoder passwordEncoder;

        @Mock
        private JwtService jwtService;

        private JwtProperties jwtProperties;
        private AuthService authService;

        @BeforeEach
        void setUp() {
                jwtProperties = new JwtProperties("secret", 3_600_000L, 2_592_000_000L);
                authService = new AuthService(
                                userRepository,
                                refreshTokenRepository,
                                passwordEncoder,
                                jwtService,
                                jwtProperties);
        }

        @Test
        void registerCreatesUserAndIssuesTokens() {
                RegisterRequest request = new RegisterRequest("user@example.com", "Password123", "Test User");
                when(userRepository.existsByEmailAndDeletedFalse(request.email())).thenReturn(false);
                when(passwordEncoder.encode(request.password())).thenReturn("hashed");

                User saved = new User();
                saved.setId(42L);
                saved.setEmail(request.email());
                saved.setFullName(request.fullName());
                saved.setRole(Role.MEMBER);
                saved.setOnboardingComplete(false);
                when(userRepository.save(any(User.class))).thenReturn(saved);

                when(jwtService.generateAccessToken(eq(42L), eq(request.email()), eq(Role.MEMBER)))
                                .thenReturn("access");
                when(jwtService.generateRefreshToken(eq(42L))).thenReturn("refresh");

                AuthResponse response = authService.register(request);

                assertThat(response.accessToken()).isEqualTo("access");
                assertThat(response.refreshToken()).isEqualTo("refresh");
                assertThat(response.user()).isNotNull();
                verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        void loginRejectsInvalidPassword() {
                User user = new User();
                user.setEmail("user@example.com");
                user.setPasswordHash("hashed");
                when(userRepository.findByEmailAndDeletedFalse("user@example.com"))
                                .thenReturn(Optional.of(user));
                when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

                assertThatThrownBy(() -> authService.login(new LoginRequest("user@example.com", "wrong")))
                                .isInstanceOf(BadCredentialsException.class);
        }

        @Test
        void refreshTokensRotatesAndRevokesOldToken() {
                User user = new User();
                user.setId(10L);
                user.setEmail("user@example.com");
                user.setRole(Role.MEMBER);

                RefreshToken token = new RefreshToken();
                token.setUser(user);
                token.setToken("refresh-token");
                token.setRevoked(false);
                token.setExpiresAt(LocalDateTime.now().plusDays(1));

                when(refreshTokenRepository.findByToken("refresh-token"))
                                .thenReturn(Optional.of(token));
                when(userRepository.findByIdAndDeletedFalse(10L))
                                .thenReturn(Optional.of(user));
                when(jwtService.generateAccessToken(10L, "user@example.com", Role.MEMBER))
                                .thenReturn("access");
                when(jwtService.generateRefreshToken(10L))
                                .thenReturn("refresh");

                AuthResponse response = authService.refreshTokens("refresh-token");

                assertThat(response.user()).isNull();
                assertThat(token.isRevoked()).isTrue();

                ArgumentCaptor<RefreshToken> tokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
                verify(refreshTokenRepository, org.mockito.Mockito.times(2)).save(tokenCaptor.capture());
                // First save revokes old token, second save persists new token
                assertThat(tokenCaptor.getAllValues().get(0).isRevoked()).isTrue();
        }

}
