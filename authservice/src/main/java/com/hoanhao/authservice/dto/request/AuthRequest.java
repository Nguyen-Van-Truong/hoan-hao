package com.hoanhao.authservice.dto.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthRequest {
    // Getters and Setters
    private String identifier; // Tên người dùng hoặc email
    private String password;

}