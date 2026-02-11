package com.anes.server.user.repository;

import com.anes.server.user.entity.ConditionType;
import com.anes.server.user.entity.HealthCondition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HealthConditionRepository extends JpaRepository<HealthCondition, Long> {

    List<HealthCondition> findAllByType(ConditionType type);

    List<HealthCondition> findAllByIdIn(List<Long> ids);
}
