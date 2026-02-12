package com.anes.server.auth.service;

import com.google.firebase.auth.AuthErrorCode;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FirebaseAuthServiceTest {

    private FirebaseAuthService firebaseAuthService;

    @BeforeEach
    void setUp() {
        firebaseAuthService = new FirebaseAuthService();
    }

    @Test
    @DisplayName("verifyIdToken: null token throws BadCredentialsException")
    void verifyIdToken_nullToken_throwsBadCredentials() {
        assertThatThrownBy(() -> firebaseAuthService.verifyIdToken(null))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Firebase ID token is required.");
    }

    @Test
    @DisplayName("verifyIdToken: blank token throws BadCredentialsException")
    void verifyIdToken_blankToken_throwsBadCredentials() {
        assertThatThrownBy(() -> firebaseAuthService.verifyIdToken("   "))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Firebase ID token is required.");
    }

    @Test
    @DisplayName("verifyIdToken: valid token returns decoded FirebaseToken")
    void verifyIdToken_validToken_returnsDecodedToken() throws FirebaseAuthException {
        FirebaseToken mockToken = mock(FirebaseToken.class);
        when(mockToken.getUid()).thenReturn("test-uid");

        FirebaseAuth mockAuth = mock(FirebaseAuth.class);
        when(mockAuth.verifyIdToken("valid-token", true)).thenReturn(mockToken);

        try (MockedStatic<FirebaseAuth> staticMock = mockStatic(FirebaseAuth.class)) {
            staticMock.when(FirebaseAuth::getInstance).thenReturn(mockAuth);

            FirebaseToken result = firebaseAuthService.verifyIdToken("valid-token");

            assertThat(result).isNotNull();
            assertThat(result.getUid()).isEqualTo("test-uid");
        }
    }

    @Test
    @DisplayName("verifyIdToken: expired token throws BadCredentialsException with 'Token has expired'")
    void verifyIdToken_expiredToken_throwsBadCredentials() throws FirebaseAuthException {
        FirebaseAuth mockAuth = mock(FirebaseAuth.class);
        FirebaseAuthException expiredException = new FirebaseAuthException(
                AuthErrorCode.EXPIRED_ID_TOKEN, "Token expired", null, null, null);
        when(mockAuth.verifyIdToken(anyString(), anyBoolean())).thenThrow(expiredException);

        try (MockedStatic<FirebaseAuth> staticMock = mockStatic(FirebaseAuth.class)) {
            staticMock.when(FirebaseAuth::getInstance).thenReturn(mockAuth);

            assertThatThrownBy(() -> firebaseAuthService.verifyIdToken("expired-token"))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Token has expired");
        }
    }

    @Test
    @DisplayName("verifyIdToken: invalid token throws BadCredentialsException with 'Invalid authentication token'")
    void verifyIdToken_invalidToken_throwsBadCredentials() throws FirebaseAuthException {
        FirebaseAuth mockAuth = mock(FirebaseAuth.class);
        FirebaseAuthException invalidException = new FirebaseAuthException(
                AuthErrorCode.INVALID_ID_TOKEN, "Invalid token", null, null, null);
        when(mockAuth.verifyIdToken(anyString(), anyBoolean())).thenThrow(invalidException);

        try (MockedStatic<FirebaseAuth> staticMock = mockStatic(FirebaseAuth.class)) {
            staticMock.when(FirebaseAuth::getInstance).thenReturn(mockAuth);

            assertThatThrownBy(() -> firebaseAuthService.verifyIdToken("invalid-token"))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Invalid authentication token");
        }
    }

    @Test
    @DisplayName("verifyIdToken: revoked token throws BadCredentialsException with 'Token has been revoked'")
    void verifyIdToken_revokedToken_throwsBadCredentials() throws FirebaseAuthException {
        FirebaseAuth mockAuth = mock(FirebaseAuth.class);
        FirebaseAuthException revokedException = new FirebaseAuthException(
                AuthErrorCode.REVOKED_ID_TOKEN, "Token revoked", null, null, null);
        when(mockAuth.verifyIdToken(anyString(), anyBoolean())).thenThrow(revokedException);

        try (MockedStatic<FirebaseAuth> staticMock = mockStatic(FirebaseAuth.class)) {
            staticMock.when(FirebaseAuth::getInstance).thenReturn(mockAuth);

            assertThatThrownBy(() -> firebaseAuthService.verifyIdToken("revoked-token"))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Token has been revoked");
        }
    }

    @Test
    @DisplayName("extractProvider: returns sign_in_provider from Firebase claims")
    void extractProvider_returnsSignInProvider() {
        FirebaseToken mockToken = mock(FirebaseToken.class);
        when(mockToken.getClaims()).thenReturn(java.util.Map.of(
                "firebase", java.util.Map.of("sign_in_provider", "google.com")
        ));

        String provider = firebaseAuthService.extractProvider(mockToken);
        assertThat(provider).isEqualTo("google.com");
    }

    @Test
    @DisplayName("extractProvider: returns 'firebase' when claims are missing")
    void extractProvider_fallsBackToFirebase() {
        FirebaseToken mockToken = mock(FirebaseToken.class);
        when(mockToken.getClaims()).thenReturn(java.util.Map.of());

        String provider = firebaseAuthService.extractProvider(mockToken);
        assertThat(provider).isEqualTo("firebase");
    }
}
