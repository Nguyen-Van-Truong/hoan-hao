package com.hoanhao.authservice.controller;

import com.hoanhao.authservice.dto.reponse.AuthResponse;
import com.hoanhao.authservice.dto.reponse.UserResponseDto;
import com.hoanhao.authservice.dto.request.AuthRequest;
import com.hoanhao.authservice.dto.request.UserRegistrationRequestDto;
import com.hoanhao.authservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Đăng nhập người dùng
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            AuthResponse response = authService.login(authRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Làm mới access token bằng refresh token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestParam String refreshToken) {
        try {
            AuthResponse response = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Đăng ký người dùng mới
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Validated @RequestBody UserRegistrationRequestDto userDto) {
        try {
            authService.registerUser(userDto);
            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Lấy thông tin người dùng theo ID
     */
//    @GetMapping("/users/{id}")
//    public ResponseEntity<?> getUserById(@PathVariable Long id) {
//        try {
//            UserResponseDto userDto = authService.getUserById(id);
//            return ResponseEntity.ok(userDto);
//        } catch (RuntimeException e) {
//            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
//        }
//    }
}