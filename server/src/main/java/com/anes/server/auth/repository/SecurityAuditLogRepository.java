package com.anes.server.auth.repository;

import com.anes.server.auth.entity.SecurityAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityAuditLogRepository extends JpaRepository<SecurityAuditLog, Long> {

    List<SecurityAuditLog> findByEventType(String eventType);

    List<SecurityAuditLog> findByUserId(Long userId);
}
