package com.deliveryflow.auth.repository;

import com.deliveryflow.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String hash);
    void deleteByUserId(String userId);
    List<RefreshToken> findAllByUserIdAndRevokedAtIsNull(String userId);
}
