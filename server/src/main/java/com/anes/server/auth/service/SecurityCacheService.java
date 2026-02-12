package com.anes.server.auth.service;

import com.anes.server.auth.repository.AuthIdentityRepository;
import com.anes.server.user.entity.User;
import com.anes.server.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

/**
 * Caches security-related signals in Redis to reduce database lookups.
 * <p>
 * Cached signals:
 * <ul>
 * <li>{@code fb:uid:{firebaseUid}} → userId (30 min TTL)</li>
 * <li>{@code user:role:{userId}} → role string (5 min TTL)</li>
 * <li>{@code user:active:{userId}} → "true"/"false" (5 min TTL)</li>
 * </ul>
 */
@Service
public class SecurityCacheService {

    private static final Logger log = LoggerFactory.getLogger(SecurityCacheService.class);

    private static final Duration UID_TTL = Duration.ofMinutes(30);
    private static final Duration ROLE_TTL = Duration.ofMinutes(5);
    private static final Duration ACTIVE_TTL = Duration.ofMinutes(5);

    private final RedisTemplate<String, String> redisTemplate;
    private final AuthIdentityRepository authIdentityRepository;
    private final UserRepository userRepository;
    private final boolean redisEnabled;

    public SecurityCacheService(
            RedisTemplate<String, String> redisTemplate,
            AuthIdentityRepository authIdentityRepository,
            UserRepository userRepository,
            @Value("${anes.redis.enabled:true}") boolean redisEnabled) {
        this.redisTemplate = redisTemplate;
        this.authIdentityRepository = authIdentityRepository;
        this.userRepository = userRepository;
        this.redisEnabled = redisEnabled;
    }

    // ── Firebase UID → User ID ──────────────────────────────────────

    /**
     * Resolve Firebase UID to user ID, using Redis cache first.
     */
    public Optional<Long> resolveUserId(String provider, String firebaseUid) {
        String key = "fb:uid:" + firebaseUid;

        if (redisEnabled) {
            try {
                String cached = redisTemplate.opsForValue().get(key);
                if (cached != null) {
                    return Optional.of(Long.parseLong(cached));
                }
            } catch (RedisConnectionFailureException e) {
                log.debug("Redis unavailable for UID cache lookup, falling back to DB");
            } catch (NumberFormatException e) {
                log.warn("Corrupt cache entry for key {}", key);
            }
        }

        // DB fallback
        return authIdentityRepository.findByProviderAndProviderUid(provider, firebaseUid)
                .map(identity -> {
                    Long userId = identity.getUser().getId();
                    cacheValue(key, String.valueOf(userId), UID_TTL);
                    return userId;
                });
    }

    // ── User Role ───────────────────────────────────────────────────

    /**
     * Get user role, using Redis cache first.
     */
    public Optional<String> getUserRole(Long userId) {
        String key = "user:role:" + userId;

        if (redisEnabled) {
            try {
                String cached = redisTemplate.opsForValue().get(key);
                if (cached != null) {
                    return Optional.of(cached);
                }
            } catch (RedisConnectionFailureException e) {
                log.debug("Redis unavailable for role cache lookup, falling back to DB");
            }
        }

        return userRepository.findById(userId)
                .map(user -> {
                    String role = user.getRole().name();
                    cacheValue(key, role, ROLE_TTL);
                    return role;
                });
    }

    // ── User Active Status ──────────────────────────────────────────

    /**
     * Check if user is active (not deleted), using Redis cache first.
     */
    public Optional<Boolean> isUserActive(Long userId) {
        String key = "user:active:" + userId;

        if (redisEnabled) {
            try {
                String cached = redisTemplate.opsForValue().get(key);
                if (cached != null) {
                    return Optional.of(Boolean.parseBoolean(cached));
                }
            } catch (RedisConnectionFailureException e) {
                log.debug("Redis unavailable for active cache lookup, falling back to DB");
            }
        }

        return userRepository.findById(userId)
                .map(user -> {
                    boolean active = !user.isDeleted();
                    cacheValue(key, String.valueOf(active), ACTIVE_TTL);
                    return active;
                });
    }

    // ── Cache Invalidation ──────────────────────────────────────────

    /**
     * Invalidate role cache for a user (call after role changes).
     */
    public void invalidateUserRole(Long userId) {
        deleteKey("user:role:" + userId);
    }

    /**
     * Invalidate active status cache for a user (call after status changes).
     */
    public void invalidateUserActive(Long userId) {
        deleteKey("user:active:" + userId);
    }

    /**
     * Invalidate Firebase UID mapping (call after identity changes).
     */
    public void invalidateFirebaseUid(String firebaseUid) {
        deleteKey("fb:uid:" + firebaseUid);
    }

    // ── Private helpers ─────────────────────────────────────────────

    private void cacheValue(String key, String value, Duration ttl) {
        if (!redisEnabled) {
            return;
        }

        try {
            redisTemplate.opsForValue().set(key, value, ttl);
        } catch (RedisConnectionFailureException e) {
            log.debug("Redis unavailable, skipping cache write for key {}", key);
        }
    }

    private void deleteKey(String key) {
        if (!redisEnabled) {
            return;
        }

        try {
            redisTemplate.delete(key);
        } catch (RedisConnectionFailureException e) {
            log.debug("Redis unavailable, skipping cache invalidation for key {}", key);
        }
    }
}
