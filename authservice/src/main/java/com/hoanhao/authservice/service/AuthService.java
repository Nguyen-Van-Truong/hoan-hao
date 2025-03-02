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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class AuthService implements IAuthService {

    private static final Logger logger = Logger.getLogger(AuthService.class.getName());

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
    private SessionRepository sessionRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public AuthResponse login(AuthRequest authRequest) {
        Optional<User> userOpt = userRepository.findByUsernameOrEmailOrPhone(authRequest.getUsernameOrEmailOrPhone());

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }

        User user = userOpt.get();

        if (!user.getIsActive()) {
            throw new RuntimeException("Account is inactive");
        }

        if (!passwordEncoder.matches(authRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        // Lưu refresh token vào bảng session
        Session session = new Session();
        session.setUser(user);
        session.setRefreshToken(refreshToken);
        session.setIpAddress("unknown");
        session.setUserAgent("unknown");
        session.setExpiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getRefreshTokenExpiration() / 1000));
        session.setCreatedAt(LocalDateTime.now());

        try {
            sessionRepository.save(session);
            logger.info("Saved session with refresh token: " + refreshToken);
        } catch (Exception e) {
            logger.severe("Failed to save session: " + e.getMessage());
            throw new RuntimeException("Failed to save session: " + e.getMessage());
        }

        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        logger.info("Received refresh token: " + refreshToken);

        // Kiểm tra tính hợp lệ của refresh token bằng JWT
        if (!jwtUtil.isTokenValid(refreshToken)) {
            logger.warning("Token invalid or expired");
            throw new RuntimeException("Invalid or expired refresh token");
        }

        // Trích xuất username
        String username = jwtUtil.extractUsername(refreshToken);
        logger.info("Extracted username: " + username);

        // Tìm user trong database
        Optional<User> userOpt = userRepository.findByUsernameOrEmailOrPhone(username);
        if (userOpt.isEmpty()) {
            logger.warning("User not found for username: " + username);
            throw new RuntimeException("User not found");
        }
        User user = userOpt.get();

        if (!user.getIsActive()) {
            logger.warning("User account is inactive for username: " + username);
            throw new RuntimeException("User account is inactive");
        }

        // Kiểm tra refresh token trong bảng session
        Optional<Session> sessionOpt = sessionRepository.findByRefreshToken(refreshToken);
        if (sessionOpt.isEmpty()) {
            logger.warning("Session not found for refresh token: " + refreshToken);
            throw new RuntimeException("Refresh token not found in session");
        }

        Session session = sessionOpt.get();
        logger.info("Found session: " + session.getId() + ", revoked: " + session.getRevokedAt());

        if (session.getRevokedAt() != null) {
            logger.warning("Refresh token revoked for session: " + session.getId());
            throw new RuntimeException("Refresh token has been revoked");
        }
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            logger.warning("Refresh token expired for session: " + session.getId());
            throw new RuntimeException("Refresh token has expired");
        }

        // Tạo token mới
        String newAccessToken = jwtUtil.generateAccessToken(username);
        String newRefreshToken = jwtUtil.generateRefreshToken(username);

        // Thu hồi token cũ
        session.setRevokedAt(LocalDateTime.now());
        sessionRepository.save(session);
        logger.info("Revoked old refresh token for session: " + session.getId());

        // Lưu refresh token mới
        Session newSession = new Session();
        newSession.setUser(user);
        newSession.setRefreshToken(newRefreshToken);
        newSession.setIpAddress(session.getIpAddress());
        newSession.setUserAgent(session.getUserAgent());
        newSession.setExpiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getRefreshTokenExpiration() / 1000));
        newSession.setCreatedAt(LocalDateTime.now());
        sessionRepository.save(newSession);
        logger.info("Saved new session with refresh token: " + newRefreshToken);

        return new AuthResponse(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void registerUser(UserRegistrationRequestDto userDto) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userDto.getCountryCode() != null && userDto.getPhoneNumber() != null) {
            if (userPhoneNumberRepository.existsByCountryCodeAndPhoneNumber(userDto.getCountryCode(), userDto.getPhoneNumber())) {
                throw new RuntimeException("Phone number already exists");
            }
        }

        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setPasswordHash(passwordEncoder.encode(userDto.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setIsActive(true);
        user.setIsVerified(false);

        User savedUser = userRepository.save(user);

        UserEmail userEmail = new UserEmail();
        userEmail.setUser(savedUser);
        userEmail.setEmail(userDto.getEmail());
        userEmail.setVisibility("private");
        userEmailRepository.save(userEmail);

        if (userDto.getCountryCode() != null && userDto.getPhoneNumber() != null) {
            UserPhoneNumber userPhone = new UserPhoneNumber();
            userPhone.setUser(savedUser);
            userPhone.setCountryCode(userDto.getCountryCode());
            userPhone.setPhoneNumber(userDto.getPhoneNumber());
            userPhone.setVisibility("private");
            userPhoneNumberRepository.save(userPhone);
        }

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Role USER not found"));
        UserRole userRoleEntity = new UserRole();
        userRoleEntity.setUser(savedUser);
        userRoleEntity.setRole(userRole);
        userRoleRepository.save(userRoleEntity);

        String userServiceUrl = "http://localhost:8081/user/createProfile";
        UserProfileRequestDto userProfileRequest = new UserProfileRequestDto(
                userDto.getUsername(),
                userDto.getEmail(),
                userDto.getFullName(),
                userDto.getDateOfBirth(),
                userDto.getCountryCode(),
                userDto.getPhoneNumber(),
                savedUser.getId()
        );
        try {
            restTemplate.postForObject(userServiceUrl, userProfileRequest, Void.class);
        } catch (Exception e) {
            logger.severe("Failed to create user profile in UserService: " + e.getMessage());
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