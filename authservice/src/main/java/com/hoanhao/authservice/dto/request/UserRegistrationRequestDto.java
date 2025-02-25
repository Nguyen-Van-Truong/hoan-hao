package com.hoanhao.authservice.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
public class UserRegistrationRequestDto {
    private String username;
    private String password;
    private String email;
    private String fullName;
    private String dateOfBirth; // Sử dụng String thay vì LocalDate
    private String countryCode;       // Thêm mã quốc gia
    private String phoneNumber;       // Thêm số điện thoại

    // Constructors, getters, setters
    public UserRegistrationRequestDto() {
    }

    public UserRegistrationRequestDto(String username, String password, String email, String fullName,
                                      String dateOfBirth, String countryCode, String phoneNumber) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.countryCode = countryCode;
        this.phoneNumber = phoneNumber;
    }

}