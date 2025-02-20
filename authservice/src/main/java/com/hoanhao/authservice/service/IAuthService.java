package com.hoanhao.authservice.service;

import com.hoanhao.authservice.dto.reponse.AuthResponse;
import com.hoanhao.authservice.dto.reponse.UserResponseDto;
import com.hoanhao.authservice.dto.request.AuthRequest;
import com.hoanhao.authservice.dto.request.UserRegistrationRequestDto;

public interface IAuthService {
    void registerUser(UserRegistrationRequestDto userDto);

    UserResponseDto getUserById(Long id); // Thêm phương thức này

    AuthResponse login(AuthRequest authRequest);
}