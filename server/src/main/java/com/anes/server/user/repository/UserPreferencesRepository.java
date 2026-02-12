package com.anes.server.user.repository;

import com.anes.server.user.entity.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {

    Optional<UserPreferences> findByUserIdAndDeletedFalse(Long userId);
}
