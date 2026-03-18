package com.evido.api.workspace.infrastructure.persistence.entity;

import com.evido.api.workspace.domain.WorkspaceRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "workspace_members")
@NoArgsConstructor
public class WorkspaceMemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;

    @Enumerated(EnumType.STRING)
    private WorkspaceRole role;

    private LocalDateTime joinedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private WorkspaceEntity workspace;

    public WorkspaceMemberEntity(String userId, WorkspaceRole role) {
        this.userId = userId;
        this.role = role;
        this.joinedAt = LocalDateTime.now();
    }

    public void setWorkspace(WorkspaceEntity workspace) {
        this.workspace = workspace;
    }
}