package com.anes.server.workout.repository;

import com.anes.server.workout.entity.WorkoutTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutTemplateRepository extends JpaRepository<WorkoutTemplate, Long> {

    List<WorkoutTemplate> findAllByProgramIdAndDeletedFalseOrderByDayNumber(Long programId);
}
