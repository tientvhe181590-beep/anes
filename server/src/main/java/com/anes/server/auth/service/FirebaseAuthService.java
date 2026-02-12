package com.anes.server.auth.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "anes.firebase.enabled", havingValue = "true")
public class FirebaseAuthService {

    private static final Logger log = LoggerFactory.getLogger(FirebaseAuthService.class);

    /**
     * Verifies a Firebase ID token and returns the decoded token.
     *
     * @param idToken the Firebase ID token from the client
     * @return decoded FirebaseToken containing uid, email, claims
     * @throws BadCredentialsException if the token is invalid, expired, or revoked
     */
    public FirebaseToken verifyIdToken(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new BadCredentialsException("Firebase ID token is required.");
        }

        try {
            // checkRevoked=true ensures revoked tokens are rejected
            return FirebaseAuth.getInstance().verifyIdToken(idToken, true);
        } catch (FirebaseAuthException ex) {
            log.warn("Firebase token verification failed: {} (code={})", ex.getMessage(), ex.getAuthErrorCode());

            String message = switch (ex.getAuthErrorCode()) {
                case EXPIRED_ID_TOKEN -> "Token has expired";
                case REVOKED_ID_TOKEN -> "Token has been revoked";
                case INVALID_ID_TOKEN -> "Invalid authentication token";
                case USER_DISABLED -> "User account has been disabled";
                default -> "Authentication failed";
            };

            throw new BadCredentialsException(message, ex);
        }
    }

    /**
     * Extracts the email from a decoded Firebase token.
     */
    public String extractEmail(FirebaseToken token) {
        return token.getEmail();
    }

    /**
     * Extracts the Firebase UID from a decoded token.
     */
    public String extractUid(FirebaseToken token) {
        return token.getUid();
    }

    /**
     * Extracts the display name from a decoded token.
     */
    public String extractDisplayName(FirebaseToken token) {
        return token.getName();
    }

    /**
     * Extracts the picture URL from a decoded token (may be null).
     */
    public String extractPictureUrl(FirebaseToken token) {
        return token.getPicture();
    }

    /**
     * Extracts the sign-in provider from a decoded token.
     * Returns "password" for email/password, "google.com" for Google, etc.
     */
    public String extractProvider(FirebaseToken token) {
        Object signInProvider = token.getClaims().get("firebase");
        if (signInProvider instanceof java.util.Map<?, ?> firebaseClaims) {
            Object provider = firebaseClaims.get("sign_in_provider");
            if (provider instanceof String p) {
                return p;
            }
        }
        return "firebase";
    }
}
