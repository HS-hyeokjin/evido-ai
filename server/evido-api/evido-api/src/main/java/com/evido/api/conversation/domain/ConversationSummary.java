package com.evido.api.conversation.domain;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ConversationSummary {

    private final Long id;
    private final Long conversationId;
    private final String summary;
    private final Long lastMessageId;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    private ConversationSummary(
            Long id,
            Long conversationId,
            String summary,
            Long lastMessageId,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.conversationId = conversationId;
        this.summary = summary;
        this.lastMessageId = lastMessageId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ConversationSummary create(
            Long conversationId,
            String summary,
            Long lastMessageId
    ) {
        LocalDateTime now = LocalDateTime.now();

        return new ConversationSummary(
                null,
                conversationId,
                summary,
                lastMessageId,
                now,
                now
        );
    }

    public static ConversationSummary of(
            Long id,
            Long conversationId,
            String summary,
            Long lastMessageId,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        return new ConversationSummary(
                id,
                conversationId,
                summary,
                lastMessageId,
                createdAt,
                updatedAt
        );
    }

    public ConversationSummary update(
            String newSummary,
            Long newLastMessageId
    ) {
        return new ConversationSummary(
                this.id,
                this.conversationId,
                newSummary,
                newLastMessageId,
                this.createdAt,
                LocalDateTime.now()
        );
    }
}