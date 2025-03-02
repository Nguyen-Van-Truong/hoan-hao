package com.hoanhao.authservice.service;

import com.hoanhao.authservice.dto.reponse.AuthResponse;
import com.hoanhao.authservice.dto.reponse.UserResponseDto;
import com.hoanhao.authservice.dto.request.*;

public interface IAuthService {
    AuthResponse login(AuthRequest authRequest);
    AuthResponse refreshToken(String refreshToken);
    void registerUser(UserRegistrationRequestDto userDto);
    void changePassword(String authorizationHeader, ChangePasswordRequest changePasswordRequest);
    void forgotPassword(ForgotPasswordRequest forgotPasswordRequest);
    void resetPassword(ResetPasswordRequest resetPasswordRequest);
}