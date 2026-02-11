package com.anes.server.nutrition.entity;

import com.anes.server.common.entity.BaseEntity;
import com.anes.server.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "user_daily_nutrition")
@Getter
@Setter
@NoArgsConstructor
public class UserDailyNutrition extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "total_calories", precision = 7, scale = 2)
    private BigDecimal totalCalories;

    @Column(name = "total_protein", precision = 7, scale = 2)
    private BigDecimal totalProtein;

    @Column(name = "total_carbs", precision = 7, scale = 2)
    private BigDecimal totalCarbs;

    @Column(name = "total_fat", precision = 7, scale = 2)
    private BigDecimal totalFat;

    @Column(name = "metrics_data", columnDefinition = "JSON")
    private String metricsData;

    @Column(nullable = false)
    private boolean deleted = false;
}
