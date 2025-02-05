package com.hoanhao.authservice.service;

import com.hoanhao.authservice.dto.reponse.UserResponseDto;
import com.hoanhao.authservice.dto.request.AuthRequest;
import com.hoanhao.authservice.dto.request.UserRegistrationRequestDto;

public interface IUserService {
    void registerUser(UserRegistrationRequestDto userDto);

    UserResponseDto getUserById(Long id); // Thêm phương thức này

    String login(AuthRequest authRequest);
}