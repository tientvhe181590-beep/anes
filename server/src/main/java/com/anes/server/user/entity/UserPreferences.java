package com.anes.server.user.entity;

import com.anes.server.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "user_preferences")
@Getter
@Setter
@NoArgsConstructor
public class UserPreferences extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type")
    private GoalType goalType;

    @Column(name = "target_weight", precision = 5, scale = 2)
    private BigDecimal targetWeight;

    @Column(name = "sessions_per_week")
    private Integer sessionsPerWeek;

    @Enumerated(EnumType.STRING)
    @Column(name = "training_location")
    private TrainingLocation trainingLocation;

    @Column(name = "available_tools", columnDefinition = "TEXT")
    private String availableTools;

    @Column(name = "target_muscle_groups", columnDefinition = "TEXT")
    private String targetMuscleGroups;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level")
    private ExperienceLevel experienceLevel;

    @Column(nullable = false)
    private boolean deleted = false;
}
