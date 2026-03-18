package com.evido.api.auth.infrastructure.persistence;

import com.evido.api.auth.domain.Role;
import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(unique = true)
    private String email;

    private String name;

    private String provider;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime lastLoginAt;

    protected UserEntity() {}

    public UserEntity(String id,
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

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

}