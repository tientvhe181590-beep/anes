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
@Table(name = "workout_templates")
@Getter
@Setter
@NoArgsConstructor
public class WorkoutTemplate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private WorkoutProgram program;

    @Column(name = "day_number", nullable = false)
    private int dayNumber;

    @Column(name = "focus_area")
    private String focusArea;

    @Column(name = "estimated_duration_mins")
    private Integer estimatedDurationMins;

    @Column(nullable = false)
    private boolean deleted = false;
}
