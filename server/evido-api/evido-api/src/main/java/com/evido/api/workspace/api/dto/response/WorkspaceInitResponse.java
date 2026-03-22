package com.evido.api.workspace.api.dto.response;

public record WorkspaceInitResponse(
        Long workspaceId,
        Long conversationId
) {}