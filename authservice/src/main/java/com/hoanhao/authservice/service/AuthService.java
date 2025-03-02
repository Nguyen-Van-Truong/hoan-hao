package com.hoanhao.authservice.service;

import com.hoanhao.authservice.dto.reponse.AuthResponse;
import com.hoanhao.authservice.dto.reponse.UserResponseDto;
import com.hoanhao.authservice.dto.request.AuthRequest;
import com.hoanhao.authservice.dto.request.ChangePasswordRequest;
import com.hoanhao.authservice.dto.request.ForgotPasswordRequest;
import com.hoanhao.authservice.dto.request.ResetPasswordRequest;
import com.hoanhao.authservice.dto.request.UserProfileRequestDto;
import com.hoanhao.authservice.dto.request.UserRegistrationRequestDto;
import com.hoanhao.authservice.entity.*;
import com.hoanhao.authservice.repository.*;
import com.hoanhao.authservice.util.JwtUtil;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
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
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private JavaMailSender mailSender; // Thêm JavaMailSender để gửi email

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

        if (!jwtUtil.isTokenValid(refreshToken)) {
            logger.warning("Token invalid or expired");
            throw new RuntimeException("Invalid or expired refresh token");
        }

        String username = jwtUtil.extractUsername(refreshToken);
        logger.info("Extracted username: " + username);

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

        String newAccessToken = jwtUtil.generateAccessToken(username);
        String newRefreshToken = jwtUtil.generateRefreshToken(username);

        session.setRevokedAt(LocalDateTime.now());
        sessionRepository.save(session);
        logger.info("Revoked old refresh token for session: " + session.getId());

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

    @Transactional
    public void changePassword(String authorizationHeader, ChangePasswordRequest changePasswordRequest) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid or missing Authorization header");
        }

        String token = authorizationHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) {
            throw new RuntimeException("Invalid or expired token");
        }

        String username = jwtUtil.extractUsername(token);
        Optional<User> userOpt = userRepository.findByUsernameOrEmailOrPhone(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        if (!user.getIsActive()) {
            throw new RuntimeException("Account is inactive");
        }

        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Old password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        sessionRepository.revokeAllSessionsByUserId(user.getId(), LocalDateTime.now());
        logger.info("Revoked all sessions for user: " + username);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest forgotPasswordRequest) {
        Optional<User> userOpt = userRepository.findByUsernameOrEmailOrPhone(forgotPasswordRequest.getUsernameOrEmailOrPhone());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        if (!user.getIsActive()) {
            throw new RuntimeException("Account is inactive");
        }

        // Tạo reset token
        String resetToken = UUID.randomUUID().toString();
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setUser(user);
        passwordResetToken.setToken(resetToken);
        passwordResetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15)); // Hết hạn sau 15 phút
        passwordResetToken.setCreatedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(passwordResetToken);

        // Gửi email với reset token (giả định email đã được cấu hình)
        String email = userEmailRepository.findByUserId(user.getId())
                .map(UserEmail::getEmail)
                .orElseThrow(() -> new RuntimeException("Email not found for user"));
        sendResetPasswordEmail(email, resetToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest resetPasswordRequest) {
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(resetPasswordRequest.getToken());
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("Invalid reset token");
        }

        PasswordResetToken token = tokenOpt.get();
        if (token.getUsedAt() != null) {
            throw new RuntimeException("Reset token has already been used");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        User user = token.getUser();
        if (!user.getIsActive()) {
            throw new RuntimeException("Account is inactive");
        }

        // Cập nhật mật khẩu
        user.setPasswordHash(passwordEncoder.encode(resetPasswordRequest.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Đánh dấu token đã sử dụng
        token.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(token);

        // Thu hồi tất cả session của user
        sessionRepository.revokeAllSessionsByUserId(user.getId(), LocalDateTime.now());
        logger.info("Revoked all sessions for user: " + user.getUsername());
    }

    @Async
    public void sendResetPasswordEmail(String email, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("Yêu cầu đặt lại mật khẩu - Hoàn Hảo");
            helper.setText(
                    "<!DOCTYPE html>" +
                            "<html>" +
                            "<head>" +
                            "<meta charset='UTF-8'>" +
                            "<style>" +
                            "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                            ".container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }" +
                            ".header { background-color: #ff69b4; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }" +
                            ".content { padding: 20px; color: #333333; }" +
                            ".token { font-size: 24px; color: #ff69b4; text-align: center; margin: 20px 0; }" +
                            ".button { display: inline-block; padding: 10px 20px; background-color: #ff69b4; color: #ffffff; text-decoration: none; border-radius: 5px; }" +
                            ".footer { text-align: center; padding: 10px; font-size: 12px; color: #777777; }" +
                            "</style>" +
                            "</head>" +
                            "<body>" +
                            "<div class='container'>" +
                            "<div class='header'>" +
                            "<h2>Mạng xã hội Hoàn Hảo</h2>" +
                            "<p>Đặt lại mật khẩu của bạn</p>" +
                            "</div>" +
                            "<div class='content'>" +
                            "<p>Chào bạn,</p>" +
                            "<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Hãy sử dụng mã dưới đây hoặc nhấp vào nút để hoàn tất:</p>" +
                            "<div class='token'>" + token + "</div>" +
                            "<p>Mã này có hiệu lực trong 15 phút.</p>" +
                            "<p style='text-align: center;'><a href='http://example.com/reset-password?token=" + token + "' class='button'>Đặt lại mật khẩu</a></p>" +
                            "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>" +
                            "</div>" +
                            "<div class='footer'>" +
                            "<p>Trân trọng,<br>Đội ngũ Hoàn Hảo</p>" +
                            "</div>" +
                            "</div>" +
                            "</body>" +
                            "</html>",
                    true // Cho phép HTML
            );
            mailSender.send(message);
            logger.info("Đã gửi email đặt lại mật khẩu đến: " + email);
        } catch (MessagingException e) {
            logger.severe("Không thể gửi email đặt lại mật khẩu: " + e.getMessage());
            throw new RuntimeException("Không thể gửi email đặt lại mật khẩu", e);
        }
    }

}