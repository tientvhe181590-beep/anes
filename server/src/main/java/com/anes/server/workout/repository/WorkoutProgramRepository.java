package com.anes.server.workout.repository;

import com.anes.server.workout.entity.WorkoutProgram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutProgramRepository extends JpaRepository<WorkoutProgram, Long> {

    List<WorkoutProgram> findAllByUserIdAndDeletedFalse(Long userId);

    Optional<WorkoutProgram> findByIdAndDeletedFalse(Long id);

    Optional<WorkoutProgram> findTopByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);
}
