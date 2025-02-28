package com.hoanhao.authservice.repository;

import com.hoanhao.authservice.entity.UserPhoneNumber;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPhoneNumberRepository extends JpaRepository<UserPhoneNumber, Long> {
    boolean existsByCountryCodeAndPhoneNumber(String countryCode, String phoneNumber);
}