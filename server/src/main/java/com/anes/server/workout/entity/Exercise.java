package com.anes.server.workout.entity;

import com.anes.server.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "exercises")
@Getter
@Setter
@NoArgsConstructor
public class Exercise extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExerciseType type;

    @Column(name = "primary_muscle_group", length = 100)
    private String primaryMuscleGroup;

    @Column(name = "equipment")
    private String equipment;

    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficulty;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "is_downloadable", nullable = false)
    private boolean isDownloadable = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "video_source")
    private VideoSource videoSource = VideoSource.YOUTUBE;

    @Column(name = "calories_per_min", precision = 6, scale = 2)
    private BigDecimal caloriesPerMin;

    @Column(nullable = false)
    private boolean deleted = false;
}
