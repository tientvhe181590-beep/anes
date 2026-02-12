package com.anes.server.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RateLimitServiceTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private RedisConnectionFactory connectionFactory;

    @Mock
    private RedisConnection redisConnection;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.getConnectionFactory()).thenReturn(connectionFactory);
        when(connectionFactory.getConnection()).thenReturn(redisConnection);
        when(redisConnection.ping()).thenReturn("PONG");

        rateLimitService = new RateLimitService(redisTemplate, objectMapper, true);
    }

    @Test
    @DisplayName("incrementCounter: returns count from Redis when available")
    void incrementCounter_incrementsViaRedis() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenReturn(1L);

        long count = rateLimitService.incrementCounter("ip", "192.168.1.1", "auth", 900);

        assertThat(count).isEqualTo(1);
        verify(redisTemplate).expire(anyString(), eq(Duration.ofSeconds(900)));
    }

    @Test
    @DisplayName("incrementCounter: sets TTL only on first increment (count=1)")
    void incrementCounter_setsExpiryOnFirstIncrement() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenReturn(5L);

        long count = rateLimitService.incrementCounter("ip", "192.168.1.1", "auth", 900);

        assertThat(count).isEqualTo(5);
        verify(redisTemplate, never()).expire(anyString(), any(Duration.class));
    }

    @Test
    @DisplayName("incrementCounter: falls back to in-memory when Redis fails")
    void incrementCounter_fallsBackOnRedisFailure() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenThrow(new RedisConnectionFailureException("down"));

        long count = rateLimitService.incrementCounter("ip", "192.168.1.1", "auth", 900);

        assertThat(count).isEqualTo(1);
        assertThat(rateLimitService.isRedisAvailable()).isFalse();
    }

    @Test
    @DisplayName("incrementCounter: subsequent calls increment in-memory counter")
    void incrementCounter_incrementsInMemory() {
        rateLimitService.setRedisAvailable(false);

        long count1 = rateLimitService.incrementCounter("ip", "10.0.0.1", "auth", 60);
        long count2 = rateLimitService.incrementCounter("ip", "10.0.0.1", "auth", 60);
        long count3 = rateLimitService.incrementCounter("ip", "10.0.0.1", "auth", 60);

        assertThat(count1).isEqualTo(1);
        assertThat(count2).isEqualTo(2);
        assertThat(count3).isEqualTo(3);
    }

    @Test
    @DisplayName("getBlockSecondsRemaining: returns 0 when no block exists in Redis")
    void getBlockRemaining_noBlock() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);

        long remaining = rateLimitService.getBlockSecondsRemaining("ip", "192.168.1.1");

        assertThat(remaining).isEqualTo(0);
    }

    @Test
    @DisplayName("getBlockSecondsRemaining: returns remaining seconds when block exists")
    void getBlockRemaining_blockedInRedis() throws Exception {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        RateLimitService.BlockEntry entry = new RateLimitService.BlockEntry(
                java.time.Instant.now().minusSeconds(30),
                java.time.Instant.now().plusSeconds(870),
                "Exceeded auth rate limit");
        String json = objectMapper.writeValueAsString(entry);
        when(valueOperations.get(anyString())).thenReturn(json);

        long remaining = rateLimitService.getBlockSecondsRemaining("ip", "192.168.1.1");

        assertThat(remaining).isGreaterThan(0);
        assertThat(remaining).isLessThanOrEqualTo(870);
    }

    @Test
    @DisplayName("getBlockSecondsRemaining: returns 0 from in-memory when no block")
    void getBlockRemaining_noBlockInMemory() {
        rateLimitService.setRedisAvailable(false);

        long remaining = rateLimitService.getBlockSecondsRemaining("ip", "10.0.0.1");

        assertThat(remaining).isEqualTo(0);
    }

    @Test
    @DisplayName("createBlock: stores block in Redis with TTL")
    void createBlock_storesInRedis() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        rateLimitService.createBlock("ip", "10.0.0.1", 900, "exceeded auth limit");

        verify(valueOperations).set(
                eq("rl:block:ip:10.0.0.1"),
                anyString(),
                eq(Duration.ofSeconds(900)));
    }

    @Test
    @DisplayName("createBlock: stores in-memory when Redis unavailable")
    void createBlock_storesInMemory() {
        rateLimitService.setRedisAvailable(false);

        rateLimitService.createBlock("ip", "10.0.0.1", 300, "exceeded limit");

        long remaining = rateLimitService.getBlockSecondsRemaining("ip", "10.0.0.1");
        assertThat(remaining).isGreaterThan(0);
        assertThat(remaining).isLessThanOrEqualTo(300);
    }

    @Test
    @DisplayName("checkRedisHealth: marks Redis as available when ping succeeds")
    void healthCheck_redisBecomesAvailable() {
        rateLimitService.setRedisAvailable(false);

        rateLimitService.checkRedisHealth();

        assertThat(rateLimitService.isRedisAvailable()).isTrue();
    }

    @Test
    @DisplayName("checkRedisHealth: marks Redis as unavailable when ping fails")
    void healthCheck_redisBecomesUnavailable() {
        when(redisTemplate.getConnectionFactory()).thenReturn(connectionFactory);
        when(connectionFactory.getConnection()).thenThrow(new RedisConnectionFailureException("down"));

        rateLimitService.checkRedisHealth();

        assertThat(rateLimitService.isRedisAvailable()).isFalse();
    }

    @Test
    @DisplayName("cleanupExpiredEntries: does not throw on empty state")
    void cleanup_empty() {
        rateLimitService.cleanupExpiredEntries();
        // no exception means success
    }
}
