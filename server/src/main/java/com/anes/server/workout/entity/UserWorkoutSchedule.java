package com.anes.server.workout.entity;

import com.anes.server.common.entity.BaseEntity;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_workout_schedule")
@Getter
@Setter
@NoArgsConstructor
public class UserWorkoutSchedule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private WorkoutTemplate template;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleStatus status = ScheduleStatus.LOCKED;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "total_calories_burned", precision = 7, scale = 2)
    private BigDecimal totalCaloriesBurned;

    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(nullable = false)
    private boolean deleted = false;
}
