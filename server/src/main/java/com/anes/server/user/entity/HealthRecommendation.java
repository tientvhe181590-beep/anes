package com.anes.server.user.entity;

import com.anes.server.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "health_recommendations")
@Getter
@Setter
@NoArgsConstructor
public class HealthRecommendation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condition_id", nullable = false)
    private HealthCondition condition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HealthRecommendationType type;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_ai_generated", nullable = false)
    private boolean isAiGenerated = false;

    @Column(name = "verified_by_admin", nullable = false)
    private boolean verifiedByAdmin = false;
}
