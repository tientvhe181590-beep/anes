package com.anes.server.workout.repository;

import com.anes.server.workout.entity.WorkoutSessionExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutSessionExerciseRepository extends JpaRepository<WorkoutSessionExercise, Long> {

    List<WorkoutSessionExercise> findAllByScheduleIdOrderByOrderIndex(Long scheduleId);
}
