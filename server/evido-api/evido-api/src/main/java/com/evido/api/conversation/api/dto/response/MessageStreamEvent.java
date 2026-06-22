package com.evido.api.conversation.api.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record MessageStreamEvent(
        String type,
        Long conversationId,
        Long messageId,
        String role,
        String content,
        String message,
        String code,
        List<Evidence> evidences,
        LocalDateTime createdAt
) {
    public static MessageStreamEvent userMessage(
            Long conversationId,
            Long messageId,
            String content,
            LocalDateTime createdAt
    ) {
        return new MessageStreamEvent(
                "user_message",
                conversationId,
                messageId,
                "user",
                content,
                null,
                null,
                null,
                createdAt
        );
    }

    public static MessageStreamEvent status(String message) {
        return new MessageStreamEvent(
                "status",
                null,
                null,
                null,
                null,
                message,
                null,
                null,
                null
        );
    }

    public static MessageStreamEvent token(String content) {
        return new MessageStreamEvent(
                "token",
                null,
                null,
                "assistant",
                content,
                null,
                null,
                null,
                null
        );
    }

    public static MessageStreamEvent evidence(List<Evidence> evidences) {
        return new MessageStreamEvent(
                "evidence",
                null,
                null,
                null,
                null,
                null,
                null,
                evidences,
                null
        );
    }

    public static MessageStreamEvent done(
            Long conversationId,
            Long messageId,
            LocalDateTime createdAt
    ) {
        return new MessageStreamEvent(
                "done",
                conversationId,
                messageId,
                "assistant",
                null,
                null,
                null,
                null,
                createdAt
        );
    }

    public static MessageStreamEvent error(String code, String message) {
        return new MessageStreamEvent(
                "error",
                null,
                null,
                null,
                null,
                message,
                code,
                null,
                null
        );
    }

    public record Evidence(
            Long chunkId,
            Double score,
            Integer chunkIndex,
            String contentHead,
            Long documentId,
            Long versionId
    ) {
    }
}