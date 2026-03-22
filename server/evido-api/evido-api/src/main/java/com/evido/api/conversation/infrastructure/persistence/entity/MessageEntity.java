package com.evido.api.conversation.infrastructure.persistence.entity;

import com.evido.api.conversation.domain.Message;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "messages")
@NoArgsConstructor
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long conversationId;

    @Enumerated(EnumType.STRING)
    private Message.Role role;

    @Lob
    private String content;

    private LocalDateTime createdAt;

    public MessageEntity(Long conversationId, Message.Role role, String content) {
        this.conversationId = conversationId;
        this.role = role;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }
}