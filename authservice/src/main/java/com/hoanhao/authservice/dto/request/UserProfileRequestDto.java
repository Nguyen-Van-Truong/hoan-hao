package com.hoanhao.authservice.dto.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class UserProfileRequestDto {

    private String username;
    private String email;
    private String fullName;

    // Constructor
    public UserProfileRequestDto(String username, String email, String fullName) {
        this.username = username;
        this.email = email;
        this.fullName = fullName;
    }
}
