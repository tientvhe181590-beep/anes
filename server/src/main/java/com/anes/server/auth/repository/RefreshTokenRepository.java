package com.anes.server.auth.repository;

import com.anes.server.auth.entity.RefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, String> {

    Optional<RefreshTokenEntity> findByTokenAndRevokedFalseAndDeletedFalse(String token);

    @Modifying
    @Query("UPDATE RefreshTokenEntity r SET r.revoked = true, r.updatedAt = :now WHERE r.user.id = :userId AND r.revoked = false")
    void revokeAllByUserId(@Param("userId") String userId, @Param("now") Instant now);
}
