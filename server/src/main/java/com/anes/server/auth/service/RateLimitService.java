package com.anes.server.auth.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Rate limiting service backed by Redis with in-memory fallback.
 * Uses INCR/EXPIRE for atomic counter increments and block keys for penalty
 * enforcement.
 */
@Service
public class RateLimitService {

    private static final Logger log = LoggerFactory.getLogger(RateLimitService.class);

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final boolean redisEnabled;

    /** Whether Redis is currently available. */
    private final AtomicBoolean redisAvailable = new AtomicBoolean(true);

    // ── In-memory fallback ────────────────────────────────────────────
    private final ConcurrentHashMap<String, AtomicLong> inMemoryCounters = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> inMemoryExpiry = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, BlockEntry> inMemoryBlocks = new ConcurrentHashMap<>();

    public RateLimitService(
            RedisTemplate<String, String> redisTemplate,
            ObjectMapper objectMapper,
            @Value("${anes.redis.enabled:true}") boolean redisEnabled) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.redisEnabled = redisEnabled;

        if (!redisEnabled) {
            redisAvailable.set(false);
            log.info("Redis disabled via configuration. Using in-memory rate limiting.");
            return;
        }

        checkRedisHealth(); // set initial state
    }

    // ── Public API ────────────────────────────────────────────────────

    /**
     * Check if identifier is currently blocked.
     *
     * @return remaining block seconds, or 0 if not blocked
     */
    public long getBlockSecondsRemaining(String type, String identifier) {
        String blockKey = "rl:block:" + type + ":" + identifier;

        if (redisEnabled && redisAvailable.get()) {
            try {
                String json = redisTemplate.opsForValue().get(blockKey);
                if (json != null) {
                    BlockEntry entry = objectMapper.readValue(json, BlockEntry.class);
                    long remaining = Duration.between(Instant.now(), entry.expiresAt()).getSeconds();
                    return Math.max(remaining, 1);
                }
                return 0;
            } catch (RedisConnectionFailureException e) {
                switchToFallback();
            } catch (JsonProcessingException e) {
                log.warn("Failed to parse block entry for key {}", blockKey, e);
                return 0;
            }
        }

        // In-memory fallback
        BlockEntry block = inMemoryBlocks.get(blockKey);
        if (block != null) {
            if (Instant.now().isBefore(block.expiresAt())) {
                return Math.max(Duration.between(Instant.now(), block.expiresAt()).getSeconds(), 1);
            }
            inMemoryBlocks.remove(blockKey);
        }
        return 0;
    }

    /**
     * Increment rate limit counter. Returns the current count after increment.
     *
     * @param type       rate limit type (e.g., "ip", "user")
     * @param identifier the IP or user ID
     * @param endpoint   endpoint category (e.g., "auth", "ai")
     * @param windowSec  window duration in seconds
     * @return current count after increment
     */
    public long incrementCounter(String type, String identifier, String endpoint, int windowSec) {
        long windowStart = Instant.now().getEpochSecond() / windowSec * windowSec;
        String key = "rl:" + type + ":" + identifier + ":" + endpoint + ":" + windowStart;

        if (redisEnabled && redisAvailable.get()) {
            try {
                Long count = redisTemplate.opsForValue().increment(key);
                if (count != null && count == 1) {
                    redisTemplate.expire(key, Duration.ofSeconds(windowSec));
                }
                return count != null ? count : 1;
            } catch (RedisConnectionFailureException e) {
                switchToFallback();
            }
        }

        // In-memory fallback
        long expireAt = (windowStart + windowSec) * 1000;
        inMemoryExpiry.putIfAbsent(key, expireAt);
        return inMemoryCounters.computeIfAbsent(key, k -> new AtomicLong(0)).incrementAndGet();
    }

    /**
     * Create a block entry for a given identifier.
     *
     * @param type         rate limit type
     * @param identifier   the blocked identifier (IP or user ID)
     * @param blockSeconds how long to block
     * @param reason       human-readable reason
     */
    public void createBlock(String type, String identifier, int blockSeconds, String reason) {
        String blockKey = "rl:block:" + type + ":" + identifier;
        Instant now = Instant.now();
        BlockEntry entry = new BlockEntry(now, now.plusSeconds(blockSeconds), reason);

        if (redisEnabled && redisAvailable.get()) {
            try {
                String json = objectMapper.writeValueAsString(entry);
                redisTemplate.opsForValue().set(blockKey, json, Duration.ofSeconds(blockSeconds));
                return;
            } catch (RedisConnectionFailureException e) {
                switchToFallback();
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize block entry", e);
                return;
            }
        }

        // In-memory fallback
        inMemoryBlocks.put(blockKey, entry);
    }

    // ── Redis health check (every 30s) ────────────────────────────────

    @Scheduled(fixedDelay = 30_000)
    public void checkRedisHealth() {
        if (!redisEnabled) {
            return;
        }

        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            if (!redisAvailable.getAndSet(true)) {
                log.info("Redis connection restored. Switching back to Redis-backed rate limiting.");
                inMemoryCounters.clear();
                inMemoryExpiry.clear();
                inMemoryBlocks.clear();
            }
        } catch (Exception e) {
            if (redisAvailable.getAndSet(false)) {
                log.warn("Redis unavailable, using in-memory rate limiting fallback.");
            }
        }
    }

    // ── In-memory cleanup (every 60s) ─────────────────────────────────

    @Scheduled(fixedDelay = 60_000)
    public void cleanupExpiredEntries() {
        long now = System.currentTimeMillis();
        inMemoryExpiry.forEach((key, expireAt) -> {
            if (now > expireAt) {
                inMemoryCounters.remove(key);
                inMemoryExpiry.remove(key);
            }
        });

        Instant nowInstant = Instant.now();
        inMemoryBlocks.entrySet().removeIf(e -> nowInstant.isAfter(e.getValue().expiresAt()));
    }

    public boolean isRedisAvailable() {
        return redisAvailable.get();
    }

    // ── Package-private for testing ───────────────────────────────────

    void setRedisAvailable(boolean available) {
        this.redisAvailable.set(available);
    }

    // ── Private helpers ───────────────────────────────────────────────

    private void switchToFallback() {
        if (redisAvailable.getAndSet(false)) {
            log.warn("Redis unavailable, using in-memory rate limiting fallback.");
        }
    }

    // ── Block entry record ────────────────────────────────────────────

    public record BlockEntry(Instant blockedAt, Instant expiresAt, String reason) {
    }
}
