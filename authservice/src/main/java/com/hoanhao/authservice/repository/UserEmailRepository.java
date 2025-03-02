package com.hoanhao.authservice.repository;

import com.hoanhao.authservice.entity.UserEmail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserEmailRepository extends JpaRepository<UserEmail, Long> {
    Optional<UserEmail> findByUserId(Long userId);
}