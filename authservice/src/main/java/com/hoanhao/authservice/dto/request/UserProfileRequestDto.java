package com.hoanhao.authservice.dto.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserProfileRequestDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String dateOfBirth;
    private String countryCode;
    private String phoneNumber;

    public UserProfileRequestDto(Long id, String username, String email, String fullName, String dateOfBirth,
                                 String countryCode, String phoneNumber) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.countryCode = countryCode;
        this.phoneNumber = phoneNumber;
    }

    public UserProfileRequestDto() {
    }
}