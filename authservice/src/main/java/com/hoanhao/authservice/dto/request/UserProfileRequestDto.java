package com.hoanhao.authservice.dto.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserProfileRequestDto {
    private String username;
    private String email;
    private String fullName;
    private String dateOfBirth;
    private String countryCode;  // Thêm countryCode
    private String phoneNumber;  // Thêm phoneNumber

    public UserProfileRequestDto(String username, String email, String fullName, String dateOfBirth,
                                 String countryCode, String phoneNumber) {
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.countryCode = countryCode;
        this.phoneNumber = phoneNumber;
    }

}