package com.anes.server.user.repository;

import com.anes.server.user.entity.UserHealthConstraint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserHealthConstraintRepository extends JpaRepository<UserHealthConstraint, Long> {

    List<UserHealthConstraint> findAllByUserIdAndDeletedFalse(Long userId);

    void deleteAllByUserId(Long userId);
}
