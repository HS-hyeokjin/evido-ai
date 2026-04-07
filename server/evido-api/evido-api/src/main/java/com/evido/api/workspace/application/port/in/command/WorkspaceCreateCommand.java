package com.evido.api.workspace.application.port.in.command;

public record WorkspaceCreateCommand(
        String userId,
        String name
) {}