package com.evido.api.conversation.application.port.in.command;

public record UpdateConversationCommand(
        Long conversationId,
        String userId,
        String title
) {}