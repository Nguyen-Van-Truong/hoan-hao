package com.hoanhao.authservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "oauth_provider", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"provider_name", "provider_id"})
})
public class OauthProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String providerName;

    @Column(nullable = false, length = 255)
    private String providerId;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}