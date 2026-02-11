package com.anes.server.workout.repository;

import com.anes.server.workout.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    List<Exercise> findAllByDeletedFalse();

    Optional<Exercise> findByIdAndDeletedFalse(Long id);

    List<Exercise> findAllByPrimaryMuscleGroupAndDeletedFalse(String primaryMuscleGroup);
}
