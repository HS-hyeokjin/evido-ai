package com.evido.api.conversation.application.port.in.query;

public record GetConversationsQuery(
        Long workspaceId,
        String userId
) {}
