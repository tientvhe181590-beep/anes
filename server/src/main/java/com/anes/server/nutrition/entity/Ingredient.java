package com.anes.server.nutrition.entity;

import com.anes.server.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "ingredients")
@Getter
@Setter
@NoArgsConstructor
public class Ingredient extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(length = 100)
    private String category;

    @Column(name = "calories_per_100g", precision = 6, scale = 2)
    private BigDecimal caloriesPer100g;

    @Column(name = "protein_per_100g", precision = 6, scale = 2)
    private BigDecimal proteinPer100g;

    @Column(name = "carbs_per_100g", precision = 6, scale = 2)
    private BigDecimal carbsPer100g;

    @Column(name = "fat_per_100g", precision = 6, scale = 2)
    private BigDecimal fatPer100g;

    @Column(nullable = false)
    private boolean deleted = false;
}
