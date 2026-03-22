package com.evido.api.conversation.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "conversations")
@NoArgsConstructor
public class ConversationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long workspaceId;

    private String title;

    private LocalDateTime createdAt;

    public ConversationEntity(Long workspaceId, String title) {
        this.workspaceId = workspaceId;
        this.title = title;
        this.createdAt = LocalDateTime.now();
    }
}