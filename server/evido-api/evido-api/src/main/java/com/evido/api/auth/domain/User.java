package com.evido.api.auth.domain;

import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
public class User {

    private final String id;
    private String email;
    private String name;
    private String provider;
    private Role role;
    private final LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    public User(String id,
                String email,
                String name,
                String provider,
                Role role,
                LocalDateTime createdAt,
                LocalDateTime lastLoginAt) {

        this.id = id;
        this.email = email;
        this.name = name;
        this.provider = provider;
        this.role = role;
        this.createdAt = createdAt;
        this.lastLoginAt = lastLoginAt;
    }

    public static User createGuest() {
        return new User(
                null,
                null,
                "GUEST",
                null,
                Role.ROLE_GUEST,
                LocalDateTime.now(),
                null
        );
    }

    public static User createOAuthUser(String email,
                                       String name,
                                       String provider) {

        return new User(
                null,
                email,
                name,
                provider,
                Role.ROLE_USER,
                LocalDateTime.now(),
                null
        );
    }
    public void upgradeToUser(String email,
                              String name,
                              String provider) {

        if (this.role != Role.ROLE_GUEST) {
            throw new IllegalStateException("이미 USER 이상 권한입니다.");
        }

        this.email = email;
        this.name = name;
        this.provider = provider;
        this.role = Role.ROLE_USER;
    }

    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }

    public boolean isGuest() {
        return this.role == Role.ROLE_GUEST;
    }

    public boolean isUser() {
        return this.role == Role.ROLE_USER;
    }

    public boolean isAdmin() {
        return this.role == Role.ROLE_ADMIN;
    }
}