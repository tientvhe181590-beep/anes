package com.anes.server.auth.service;

import com.anes.server.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Optional;

@Component
public class JwtService {

    private final SecretKey signingKey;
    private final JwtProperties props;

    public JwtService(JwtProperties props) {
        this.props = props;
        // Pad secret to at least 32 bytes for HS256
        var secret = props.getSecret();
        if (secret.length() < 32) {
            secret = secret + "0".repeat(32 - secret.length());
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String userId, String email, String role) {
        return Jwts.builder()
                .subject(userId)
                .claims(Map.of("email", email, "role", role))
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusMillis(props.getAccessTokenExpiryMs())))
                .signWith(signingKey)
                .compact();
    }

    public String generateRefreshToken(String userId) {
        return Jwts.builder()
                .subject(userId)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusMillis(props.getRefreshTokenExpiryMs())))
                .signWith(signingKey)
                .compact();
    }

    public Optional<Claims> parseToken(String token) {
        try {
            var claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public long getRefreshTokenExpiryMs() {
        return props.getRefreshTokenExpiryMs();
    }
}
