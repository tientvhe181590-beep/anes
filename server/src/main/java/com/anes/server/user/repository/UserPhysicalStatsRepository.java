package com.anes.server.user.repository;

import com.anes.server.user.entity.UserPhysicalStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserPhysicalStatsRepository extends JpaRepository<UserPhysicalStats, Long> {

    Optional<UserPhysicalStats> findTopByUserIdAndDeletedFalseOrderByRecordedAtDesc(Long userId);

    List<UserPhysicalStats> findAllByUserIdAndDeletedFalseOrderByRecordedAtDesc(Long userId);
}
