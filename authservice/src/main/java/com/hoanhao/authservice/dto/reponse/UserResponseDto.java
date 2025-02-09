package com.hoanhao.authservice.dto.reponse;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponseDto {
    private Long id;
    private String username;
    private LocalDateTime createdAt;
}
