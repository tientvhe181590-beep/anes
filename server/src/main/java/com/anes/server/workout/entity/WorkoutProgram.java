package com.anes.server.workout.entity;

import com.anes.server.common.entity.BaseEntity;
import com.anes.server.user.entity.GoalType;
import com.anes.server.user.entity.User;
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
@Table(name = "workout_programs")
@Getter
@Setter
@NoArgsConstructor
public class WorkoutProgram extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type")
    private GoalType goalType;

    @Column(name = "duration_weeks")
    private Integer durationWeeks;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level")
    private DifficultyLevel difficultyLevel;

    @Column(name = "is_ai_generated", nullable = false)
    private boolean isAiGenerated = false;

    @Column(nullable = false)
    private boolean deleted = false;
}
