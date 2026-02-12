package com.anes.server.user.entity;

import com.anes.server.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "membership_tiers")
@Getter
@Setter
@NoArgsConstructor
public class MembershipTier extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;
}
