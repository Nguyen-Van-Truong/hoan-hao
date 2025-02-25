package com.hoanhao.authservice.service;

import com.hoanhao.authservice.dto.reponse.AuthResponse;
import com.hoanhao.authservice.dto.reponse.UserResponseDto;
import com.hoanhao.authservice.dto.request.AuthRequest;
import com.hoanhao.authservice.dto.request.UserProfileRequestDto;
import com.hoanhao.authservice.dto.request.UserRegistrationRequestDto;
import com.hoanhao.authservice.entity.*;
import com.hoanhao.authservice.repository.*;
import com.hoanhao.authservice.util.JwtUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService implements IAuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserEmailRepository userEmailRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private UserRoleRepository userRoleRepository;
    @Autowired
    private UserPhoneNumberRepository userPhoneNumberRepository;
    @Autowired
    private RestTemplate restTemplate;
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

    @Transactional
    public void registerUser(UserRegistrationRequestDto userDto) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Tạo đối tượng User
        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setPasswordHash(passwordEncoder.encode(userDto.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setIsActive(true);
        user.setIsVerified(false);

        // Lưu User
        userRepository.save(user);

        // Lưu email
        UserEmail userEmail = new UserEmail();
        userEmail.setUser(user);
        userEmail.setEmail(userDto.getEmail());
        userEmail.setVisibility("private");
        userEmailRepository.save(userEmail);

        // Lưu số điện thoại nếu có
        if (userDto.getCountryCode() != null && userDto.getPhoneNumber() != null) {
            UserPhoneNumber userPhone = new UserPhoneNumber();
            userPhone.setUser(user);
            userPhone.setCountryCode(userDto.getCountryCode());
            userPhone.setPhoneNumber(userDto.getPhoneNumber());
            userPhone.setVisibility("private");
            userPhoneNumberRepository.save(userPhone);
        }

        // Gán role 'USER'
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Role USER not found"));
        UserRole userRoleEntity = new UserRole();
        userRoleEntity.setUser(user);
        userRoleEntity.setRole(userRole);
        userRoleRepository.save(userRoleEntity);

        // Gửi thông tin đến UserService
        String userServiceUrl = "http://localhost:8081/api/user/createProfile";
        UserProfileRequestDto userProfileRequest = new UserProfileRequestDto(
                userDto.getUsername(),
                userDto.getEmail(),
                userDto.getFullName(),
                userDto.getDateOfBirth(),
                userDto.getCountryCode(),  // Truyền countryCode
                userDto.getPhoneNumber()   // Truyền phoneNumber
        );
        try {
            restTemplate.postForObject(userServiceUrl, userProfileRequest, Void.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user profile in UserService, rolling back registration.", e);
        }
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
