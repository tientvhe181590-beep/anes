package com.anes.server.nutrition.repository;

import com.anes.server.nutrition.entity.UserDailyNutrition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserDailyNutritionRepository extends JpaRepository<UserDailyNutrition, Long> {

    Optional<UserDailyNutrition> findByUserIdAndDateAndDeletedFalse(Long userId, LocalDate date);

    List<UserDailyNutrition> findAllByUserIdAndDateBetweenAndDeletedFalseOrderByDate(
            Long userId, LocalDate startDate, LocalDate endDate);
}
