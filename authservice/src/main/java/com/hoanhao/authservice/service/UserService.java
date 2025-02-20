package com.hoanhao.authservice.service;

import com.hoanhao.authservice.dto.reponse.AuthResponse;
import com.hoanhao.authservice.dto.reponse.UserResponseDto;
import com.hoanhao.authservice.dto.request.AuthRequest;
import com.hoanhao.authservice.dto.request.UserRegistrationRequestDto;
import com.hoanhao.authservice.entity.User;
import com.hoanhao.authservice.entity.UserEmail;
import com.hoanhao.authservice.repository.UserEmailRepository;
import com.hoanhao.authservice.repository.UserRepository;
import com.hoanhao.authservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService implements IUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserEmailRepository userEmailRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthResponse login(AuthRequest authRequest) {
        Optional<User> userOpt = userRepository.findByUsernameOrEmailOrPhone(authRequest.getUsernameOrEmailOrPhone());

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(authRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        return new AuthResponse(accessToken, refreshToken);
    }

    public void registerUser(UserRegistrationRequestDto userDto) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Tạo mới đối tượng User
        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setPasswordHash(passwordEncoder.encode(userDto.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setIsActive(true);
        user.setIsVerified(false);

        // Lưu User vào cơ sở dữ liệu, Hibernate sẽ tạo id tự động
        userRepository.save(user);

        // Tạo mới đối tượng UserEmail và gán đối tượng User vào UserEmail
        UserEmail userEmail = new UserEmail();
        userEmail.setUser(user);  // Gán đối tượng User vào UserEmail
        userEmail.setEmail(userDto.getEmail());
        userEmail.setVisibility("private"); // Hoặc "public" tùy vào yêu cầu

        // Lưu UserEmail vào cơ sở dữ liệu
        userEmailRepository.save(userEmail);
    }


    public UserResponseDto getUserById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            UserResponseDto userResponse = new UserResponseDto();
            userResponse.setId(user.getId());
            userResponse.setUsername(user.getUsername());
            userResponse.setCreatedAt(user.getCreatedAt());
            return userResponse;
        } else {
            throw new RuntimeException("User not found");
        }
    }
}
