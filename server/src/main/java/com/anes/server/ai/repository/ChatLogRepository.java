package com.anes.server.ai.repository;

import com.anes.server.ai.entity.ChatLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatLogRepository extends JpaRepository<ChatLog, Long> {

    List<ChatLog> findAllByUserIdAndSessionIdOrderByCreatedAtAsc(Long userId, String sessionId);

    List<ChatLog> findAllByUserIdOrderByCreatedAtDesc(Long userId);
}
