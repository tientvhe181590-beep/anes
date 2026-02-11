package com.anes.server.nutrition.repository;

import com.anes.server.nutrition.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    List<Ingredient> findAllByDeletedFalse();

    Optional<Ingredient> findByIdAndDeletedFalse(Long id);

    List<Ingredient> findAllByCategoryAndDeletedFalse(String category);
}
