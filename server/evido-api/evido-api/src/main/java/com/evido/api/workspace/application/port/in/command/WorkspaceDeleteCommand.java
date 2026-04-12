package com.evido.api.workspace.application.port.in.command;

public record WorkspaceDeleteCommand(
        Long workspaceId,
        String userId
) {}