package com.anes.server.ai.repository;

import com.anes.server.ai.entity.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, Long> {

    List<AiUsageLog> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COUNT(a) FROM AiUsageLog a WHERE a.user.id = :userId AND a.createdAt >= :since")
    long countByUserIdSince(Long userId, LocalDateTime since);
}
