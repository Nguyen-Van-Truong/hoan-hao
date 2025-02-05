package com.hoanhao.authservice.service;

import com.hoanhao.authservice.dto.reponse.UserResponseDto;
import com.hoanhao.authservice.dto.request.AuthRequest;
import com.hoanhao.authservice.dto.request.UserRegistrationRequestDto;
import com.hoanhao.authservice.entity.User;
import com.hoanhao.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements IUserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public String login(AuthRequest authRequest) {
        User user;

        // Kiểm tra xem identifier có phải là email hay không
        if (authRequest.getIdentifier() != null && authRequest.getIdentifier().contains("@")) {
            user = userRepository.findByEmail(authRequest.getIdentifier())
                    .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        } else {
            user = userRepository.findByUsername(authRequest.getIdentifier())
                    .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        }

        // Kiểm tra mật khẩu
        if (!passwordEncoder.matches(authRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        return user.getUsername(); // Hoặc tạo JWT token
    }

    @Override
    public void registerUser(UserRegistrationRequestDto userDto) {
        // Kiểm tra xem người dùng đã tồn tại chưa
        if (userRepository.findByUsername(userDto.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Tạo người dùng mới
        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(userDto.getPassword()));
        userRepository.save(user);
    }

    @Override
    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponseDto(user.getId(), user.getUsername(), user.getEmail());
    }
}