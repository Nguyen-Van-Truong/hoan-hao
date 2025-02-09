package com.hoanhao.authservice.dto.request;

import lombok.Data;

@Data
public class AuthRequest {
    private String usernameOrEmailOrPhone;
    private String password;
}
