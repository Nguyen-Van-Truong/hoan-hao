package com.hoanhao.authservice.repository;

import com.hoanhao.authservice.entity.UserEmail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserEmailRepository extends JpaRepository<UserEmail, Long> {
}
