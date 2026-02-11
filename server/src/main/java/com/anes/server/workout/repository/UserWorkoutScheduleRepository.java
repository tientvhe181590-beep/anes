package com.anes.server.workout.repository;

import com.anes.server.workout.entity.ScheduleStatus;
import com.anes.server.workout.entity.UserWorkoutSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserWorkoutScheduleRepository extends JpaRepository<UserWorkoutSchedule, Long> {

    List<UserWorkoutSchedule> findAllByUserIdAndDeletedFalseOrderByScheduledDate(Long userId);

    List<UserWorkoutSchedule> findAllByUserIdAndScheduledDateBetweenAndDeletedFalseOrderByScheduledDate(
            Long userId, LocalDate startDate, LocalDate endDate);

    Optional<UserWorkoutSchedule> findByUserIdAndScheduledDateAndDeletedFalse(
            Long userId, LocalDate scheduledDate);

    long countByUserIdAndStatusAndDeletedFalse(Long userId, ScheduleStatus status);
}
