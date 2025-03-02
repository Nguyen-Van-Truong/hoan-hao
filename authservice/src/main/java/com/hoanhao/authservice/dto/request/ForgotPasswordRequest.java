package com.hoanhao.authservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordRequest {
    @NotBlank(message = "Username, email or phone number is required")
    private String usernameOrEmailOrPhone;
}

