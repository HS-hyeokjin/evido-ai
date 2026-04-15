package com.evido.api.conversation.application.port.in.command;

public record DeleteConversationCommand(
        Long conversationId,
        String userId
) {}