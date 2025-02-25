package com.hoanhao.authservice.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
public class UserProfileRequestDto {
    private String username;
    private String email;
    private String fullName;
    private String dateOfBirth; // Sử dụng String

    public UserProfileRequestDto(String username, String email, String fullName, String dateOfBirth) {
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
    }

}