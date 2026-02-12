package com.anes.server.workout.repository;

import com.anes.server.workout.entity.WorkoutTemplateExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutTemplateExerciseRepository extends JpaRepository<WorkoutTemplateExercise, Long> {

    List<WorkoutTemplateExercise> findAllByTemplateIdOrderByOrderIndex(Long templateId);
}
