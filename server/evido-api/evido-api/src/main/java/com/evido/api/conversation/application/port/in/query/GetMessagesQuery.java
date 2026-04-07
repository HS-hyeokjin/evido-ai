package com.evido.api.conversation.application.port.in.query;

public record GetMessagesQuery(
        Long conversationId,
        String userId
) {
}