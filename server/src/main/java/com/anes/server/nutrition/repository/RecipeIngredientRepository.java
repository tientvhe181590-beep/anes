package com.anes.server.nutrition.repository;

import com.anes.server.nutrition.entity.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {

    List<RecipeIngredient> findAllByRecipeId(Long recipeId);
}
