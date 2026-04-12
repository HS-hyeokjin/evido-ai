package com.evido.api.workspace.application.port.in.command;

public record WorkspaceUpdateCommand(
        Long workspaceId,
        String userId,
        String name
) {}