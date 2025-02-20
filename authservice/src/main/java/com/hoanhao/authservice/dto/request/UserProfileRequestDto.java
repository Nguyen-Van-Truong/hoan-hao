package com.hoanhao.authservice.dto.request;

public class UserProfileRequestDto {

    private String username;
    private String email;

    // Constructor
    public UserProfileRequestDto(String username, String email) {
        this.username = username;
        this.email = email;
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
