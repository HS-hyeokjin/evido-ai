package com.evido.api.chat.domain;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class Chat {

    private Long id;
    private Long workspaceId;
    private String title;
    private LocalDateTime createdAt;

    private Chat(Long workspaceId, String title) {
        this.workspaceId = workspaceId;
        this.title = title;
        this.createdAt = LocalDateTime.now();
    }

    public Chat(Long id,
                Long workspaceId,
                String title,
                LocalDateTime createdAt) {
        this.id = id;
        this.workspaceId = workspaceId;
        this.title = title;
        this.createdAt = createdAt;
    }

    public static Chat create(Long workspaceId, String title) {
        return new Chat(workspaceId, title);
    }
}