package com.evido.api.workspace.application.dto;

import com.evido.api.workspace.domain.Workspace;

import java.time.LocalDateTime;

public record WorkspaceResult(
        Long id,
        String name,
        LocalDateTime createdAt
) {
    public static WorkspaceResult from(Workspace workspace) {
        return new WorkspaceResult(
                workspace.getId(),
                workspace.getName(),
                workspace.getCreatedAt()
        );
    }
}