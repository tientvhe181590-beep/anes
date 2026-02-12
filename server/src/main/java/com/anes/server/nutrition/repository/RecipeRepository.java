package com.anes.server.nutrition.repository;

import com.anes.server.nutrition.entity.MealType;
import com.anes.server.nutrition.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    List<Recipe> findAllByDeletedFalse();

    Optional<Recipe> findByIdAndDeletedFalse(Long id);

    List<Recipe> findAllByMealTypeAndDeletedFalse(MealType mealType);
}
