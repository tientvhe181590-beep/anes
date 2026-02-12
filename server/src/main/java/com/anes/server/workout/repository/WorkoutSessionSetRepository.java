package com.anes.server.workout.repository;

import com.anes.server.workout.entity.WorkoutSessionSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutSessionSetRepository extends JpaRepository<WorkoutSessionSet, Long> {

    List<WorkoutSessionSet> findAllBySessionExerciseIdOrderBySetNumber(Long sessionExerciseId);
}
