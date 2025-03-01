package com.hoanhao.authservice.util;

import com.hoanhao.authservice.entity.User;
import com.hoanhao.authservice.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    // Secret key cố định, plain text, đủ dài cho HS256
    private String secretKey = "mysecretkeyforhs256whichislongenough";

    @Value("${security.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${security.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Autowired
    private UserRepository userRepository;

    // Tạo access token với HS256
    public String generateAccessToken(String username) {
        User user = userRepository.findByUsernameOrEmailOrPhone(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        return Jwts.builder()
                .setSubject(username)
                .claim("userId", user.getId())
                .setIssuer("hoanhao-auth-service")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(SignatureAlgorithm.HS256, secretKey.getBytes()) // Sử dụng HS256
                .compact();
    }

    // Tạo refresh token với HS256
    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(SignatureAlgorithm.HS256, secretKey.getBytes()) // Sử dụng HS256
                .compact();
    }

    // Trích xuất username từ token
    public String extractUsername(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey.getBytes())
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Kiểm tra tính hợp lệ của token
    public Boolean isTokenValid(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey.getBytes()).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}