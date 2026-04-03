package com.evido.api.conversation.application.port.in.command;

public record CreateConversationCommand(
        Long workspaceId,
        String userId
) {
}