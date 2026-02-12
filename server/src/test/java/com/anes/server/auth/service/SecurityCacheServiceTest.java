package com.anes.server.auth.service;

import com.anes.server.auth.entity.AuthIdentity;
import com.anes.server.auth.repository.AuthIdentityRepository;
import com.anes.server.user.entity.Role;
import com.anes.server.user.entity.User;
import com.anes.server.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityCacheServiceTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private AuthIdentityRepository authIdentityRepository;

    @Mock
    private UserRepository userRepository;

    private SecurityCacheService service;

    @BeforeEach
    void setUp() {
        service = new SecurityCacheService(redisTemplate, authIdentityRepository, userRepository, true);
    }

    @Test
    @DisplayName("resolveUserId: returns cached userId on cache hit")
    void resolveUserId_cacheHit() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("fb:uid:abc123")).thenReturn("42");

        Optional<Long> result = service.resolveUserId("firebase", "abc123");

        assertThat(result).contains(42L);
    }

    @Test
    @DisplayName("resolveUserId: queries DB and caches result on cache miss")
    void resolveUserId_cacheMiss() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("fb:uid:abc123")).thenReturn(null);

        User user = new User();
        user.setId(42L);
        AuthIdentity identity = new AuthIdentity(user, "firebase", "abc123", "user@test.com");
        when(authIdentityRepository.findByProviderAndProviderUid("firebase", "abc123"))
                .thenReturn(Optional.of(identity));

        Optional<Long> result = service.resolveUserId("firebase", "abc123");

        assertThat(result).contains(42L);
        verify(valueOperations).set(eq("fb:uid:abc123"), eq("42"), eq(Duration.ofMinutes(30)));
    }

    @Test
    @DisplayName("resolveUserId: returns empty when user not in DB")
    void resolveUserId_userNotFound() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("fb:uid:unknown")).thenReturn(null);
        when(authIdentityRepository.findByProviderAndProviderUid("firebase", "unknown"))
                .thenReturn(Optional.empty());

        Optional<Long> result = service.resolveUserId("firebase", "unknown");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("resolveUserId: falls back to DB when Redis unavailable")
    void resolveUserId_redisFallback() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenThrow(new RedisConnectionFailureException("down"));

        User user = new User();
        user.setId(7L);
        AuthIdentity identity = new AuthIdentity(user, "firebase", "uid-7", "test@test.com");
        when(authIdentityRepository.findByProviderAndProviderUid("firebase", "uid-7"))
                .thenReturn(Optional.of(identity));

        Optional<Long> result = service.resolveUserId("firebase", "uid-7");

        assertThat(result).contains(7L);
    }

    @Test
    @DisplayName("getUserRole: returns cached role on cache hit")
    void getUserRole_cacheHit() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("user:role:42")).thenReturn("MEMBER");

        Optional<String> result = service.getUserRole(42L);

        assertThat(result).contains("MEMBER");
    }

    @Test
    @DisplayName("getUserRole: queries DB and caches on cache miss")
    void getUserRole_cacheMiss() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("user:role:42")).thenReturn(null);

        User user = new User();
        user.setId(42L);
        user.setRole(Role.ADMIN);
        when(userRepository.findById(42L)).thenReturn(Optional.of(user));

        Optional<String> result = service.getUserRole(42L);

        assertThat(result).contains("ADMIN");
        verify(valueOperations).set(eq("user:role:42"), eq("ADMIN"), eq(Duration.ofMinutes(5)));
    }

    @Test
    @DisplayName("isUserActive: returns cached active status on cache hit")
    void isUserActive_cacheHit() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("user:active:42")).thenReturn("true");

        Optional<Boolean> result = service.isUserActive(42L);

        assertThat(result).contains(true);
    }

    @Test
    @DisplayName("isUserActive: returns false for deleted user")
    void isUserActive_deletedUser() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("user:active:99")).thenReturn(null);

        User user = new User();
        user.setId(99L);
        user.setDeleted(true);
        when(userRepository.findById(99L)).thenReturn(Optional.of(user));

        Optional<Boolean> result = service.isUserActive(99L);

        assertThat(result).contains(false);
    }

    @Test
    @DisplayName("invalidateUserRole: deletes the correct key")
    void invalidateUserRole_deletesKey() {
        service.invalidateUserRole(42L);

        verify(redisTemplate).delete("user:role:42");
    }

    @Test
    @DisplayName("invalidateUserActive: deletes the correct key")
    void invalidateUserActive_deletesKey() {
        service.invalidateUserActive(42L);

        verify(redisTemplate).delete("user:active:42");
    }

    @Test
    @DisplayName("invalidateFirebaseUid: deletes the correct key")
    void invalidateFirebaseUid_deletesKey() {
        service.invalidateFirebaseUid("abc123");

        verify(redisTemplate).delete("fb:uid:abc123");
    }
}
