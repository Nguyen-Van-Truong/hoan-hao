package com.hoanhao.authservice.repository;

import com.hoanhao.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u " +
            "LEFT JOIN u.userEmails e " +  // Thay đổi tên entity userEmails
            "WHERE u.username = :usernameOrEmailOrPhone " +
            "OR e.email = :usernameOrEmailOrPhone " +
            "OR EXISTS (SELECT 1 FROM UserPhoneNumber p WHERE p.user = u AND (p.phoneNumber = :usernameOrEmailOrPhone))")
    Optional<User> findByUsernameOrEmailOrPhone(String usernameOrEmailOrPhone);

    boolean existsByUsername(String username);
}
