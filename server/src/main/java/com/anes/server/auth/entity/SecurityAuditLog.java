package com.anes.server.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "security_audit_logs", indexes = {
        @Index(name = "idx_audit_event_type_created", columnList = "event_type, created_at"),
        @Index(name = "idx_audit_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
public class SecurityAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public SecurityAuditLog(String eventType, Long userId, String ipAddress, String userAgent, String details) {
        this.eventType = eventType;
        this.userId = userId;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.details = details;
    }
}
