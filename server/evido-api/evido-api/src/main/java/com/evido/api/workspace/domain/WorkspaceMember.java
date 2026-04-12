package com.evido.api.workspace.domain;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class WorkspaceMember {

    private final String userId;
    private Long workspaceId;
    private WorkspaceRole role;
    private final LocalDateTime joinedAt;

    private WorkspaceMember(String userId, WorkspaceRole role) {
        this.userId = userId;
        this.role = role;
        this.joinedAt = LocalDateTime.now();
    }

    public WorkspaceMember(
            String userId,
            Long workspaceId,
            WorkspaceRole role,
            LocalDateTime joinedAt
    ) {
        this.userId = userId;
        this.workspaceId = workspaceId;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public static WorkspaceMember createOwner(String userId, Long workspaceId) {
        return new WorkspaceMember(userId, WorkspaceRole.OWNER);
    }

    public static WorkspaceMember createMember(String userId, Long workspaceId) {
        return new WorkspaceMember(userId, WorkspaceRole.MEMBER);
    }

    public boolean isOwner() {
        return this.role == WorkspaceRole.OWNER;
    }
}