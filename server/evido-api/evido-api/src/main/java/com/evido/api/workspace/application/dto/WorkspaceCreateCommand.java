package com.evido.api.workspace.application.dto;

public record WorkspaceCreateCommand(
        String userId,
        String name
) {}