package com.hoanhao.authservice.repository;

import com.hoanhao.authservice.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Long> {
    Optional<Session> findByRefreshToken(String refreshToken);

    @Transactional
    @Modifying
    @Query("DELETE FROM Session s WHERE s.revokedAt < :threshold OR s.expiresAt < :threshold")
    int deleteByRevokedAtBeforeOrExpiresAtBefore(LocalDateTime threshold, LocalDateTime expiresThreshold);
}