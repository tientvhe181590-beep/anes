package com.anes.server.workout.entity;

import com.anes.server.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "workout_session_exercises")
@Getter
@Setter
@NoArgsConstructor
public class WorkoutSessionExercise extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private UserWorkoutSchedule schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "is_extra", nullable = false)
    private boolean isExtra = false;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
