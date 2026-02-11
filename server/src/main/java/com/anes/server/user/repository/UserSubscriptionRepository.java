package com.anes.server.user.repository;

import com.anes.server.user.entity.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {

    Optional<UserSubscription> findByUserIdAndStatusAndDeletedFalse(
            Long userId, com.anes.server.user.entity.SubscriptionStatus status);

    Optional<UserSubscription> findTopByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);
}
