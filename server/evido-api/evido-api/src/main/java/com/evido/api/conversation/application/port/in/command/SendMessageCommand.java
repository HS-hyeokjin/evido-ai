package com.evido.api.conversation.application.port.in.command;

public record SendMessageCommand(
        Long conversationId,
        String userId,
        String content
) {
}