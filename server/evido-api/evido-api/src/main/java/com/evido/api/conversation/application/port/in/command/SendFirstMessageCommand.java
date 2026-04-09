package com.evido.api.conversation.application.port.in.command;

public record SendFirstMessageCommand(
        Long workspaceId,
        String userId,
        String content
) {
}
