package com.anes.server.user.entity;

import com.anes.server.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_health_constraints",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_user_condition",
                columnNames = {"user_id", "condition_id"}))
@Getter
@Setter
@NoArgsConstructor
public class UserHealthConstraint extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condition_id", nullable = false)
    private HealthCondition condition;

    @Column(name = "severity_notes", columnDefinition = "TEXT")
    private String severityNotes;

    @Column(nullable = false)
    private boolean deleted = false;
}
