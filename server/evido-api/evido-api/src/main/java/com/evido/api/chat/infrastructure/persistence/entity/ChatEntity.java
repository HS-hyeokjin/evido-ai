package com.evido.api.chat.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "chats")
@NoArgsConstructor
public class ChatEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long workspaceId;

    private String title;

    private LocalDateTime createdAt;

    public ChatEntity(Long workspaceId, String title) {
        this.workspaceId = workspaceId;
        this.title = title;
        this.createdAt = LocalDateTime.now();
    }
}