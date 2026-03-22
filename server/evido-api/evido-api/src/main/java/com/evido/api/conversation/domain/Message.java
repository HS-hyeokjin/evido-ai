package com.evido.api.conversation.domain;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class Message {

    private Long id;
    private Long conversationId;
    private Role role;
    private String content;
    private LocalDateTime createdAt;

    public enum Role {
        USER, ASSISTANT
    }

    private Message(Long conversationId, Role role, String content) {
        this.conversationId = conversationId;
        this.role = role;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }

    public Message(Long id,
                   Long conversationId,
                   Role role,
                   String content,
                   LocalDateTime createdAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.role = role;
        this.content = content;
        this.createdAt = createdAt;
    }

    public static Message createUser(Long conversationId, String content) {
        return new Message(conversationId, Role.USER, content);
    }

    public static Message createAssistant(Long conversationId, String content) {
        return new Message(conversationId, Role.ASSISTANT, content);
    }
}