package com.hoanhao.authservice.util;

import com.hoanhao.authservice.entity.User;
import com.hoanhao.authservice.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    private String secretKey = "mysecretkeyforhs256whichislongenough"; // Nên lưu trong file cấu hình

    @Value("${security.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    // Getter để lấy expiration cho session
    @Getter
    @Value("${security.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Autowired
    private UserRepository userRepository;

    public String generateAccessToken(String username) {
        User user = userRepository.findByUsernameOrEmailOrPhone(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        if (!user.getIsActive()) {
            throw new RuntimeException("User account is inactive");
        }

        return Jwts.builder()
                .setSubject(username)
                .claim("userId", user.getId())
                .setIssuer("hoanhao-auth-service")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(SignatureAlgorithm.HS256, secretKey.getBytes())
                .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(SignatureAlgorithm.HS256, secretKey.getBytes())
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey.getBytes())
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public Boolean isTokenValid(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey.getBytes()).parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            throw new RuntimeException("Token has expired");
        } catch (io.jsonwebtoken.SignatureException e) {
            throw new RuntimeException("Invalid token signature");
        } catch (Exception e) {
            return false;
        }
    }

}