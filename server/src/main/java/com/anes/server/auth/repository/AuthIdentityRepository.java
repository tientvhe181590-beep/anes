package com.anes.server.auth.repository;

import com.anes.server.auth.entity.AuthIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuthIdentityRepository extends JpaRepository<AuthIdentity, Long> {

    Optional<AuthIdentity> findByProviderAndProviderUid(String provider, String providerUid);

    List<AuthIdentity> findByUserId(Long userId);

    boolean existsByProviderAndProviderUid(String provider, String providerUid);
}
