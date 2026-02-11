package com.anes.server.ai.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AiRateLimiter {

    private final Map<Long, Deque<Instant>> requests = new ConcurrentHashMap<>();

    public boolean tryConsume(Long userId, int limitPerMinute) {
        Deque<Instant> deque = requests.computeIfAbsent(userId, id -> new ArrayDeque<>());
        Instant cutoff = Instant.now().minusSeconds(60);

        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst().isBefore(cutoff)) {
                deque.pollFirst();
            }

            if (deque.size() >= limitPerMinute) {
                return false;
            }

            deque.addLast(Instant.now());
            return true;
        }
    }
}
