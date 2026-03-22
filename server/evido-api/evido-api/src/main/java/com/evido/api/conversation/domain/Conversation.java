package com.evido.api.conversation.domain;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class Conversation {

    private Long id;
    private Long workspaceId;
    private String title;
    private LocalDateTime createdAt;

    private Conversation(Long workspaceId, String title) {
        this.workspaceId = workspaceId;
        this.title = title;
        this.createdAt = LocalDateTime.now();
    }

    public Conversation(Long id,
                        Long workspaceId,
                        String title,
                        LocalDateTime createdAt) {
        this.id = id;
        this.workspaceId = workspaceId;
        this.title = title;
        this.createdAt = createdAt;
    }

    public static Conversation create(Long workspaceId, String title) {
        return new Conversation(workspaceId, title);
    }
}