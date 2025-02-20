package com.hoanhao.authservice.dto.request;

import lombok.Data;

@Data
public class UserRegistrationRequestDto {
    private String username;
    private String email;
    private String password;
}
