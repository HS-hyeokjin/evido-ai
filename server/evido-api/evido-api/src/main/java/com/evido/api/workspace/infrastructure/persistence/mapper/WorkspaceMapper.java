package com.evido.api.workspace.infrastructure.persistence.mapper;

import com.evido.api.workspace.domain.Workspace;
import com.evido.api.workspace.domain.WorkspaceMember;
import com.evido.api.workspace.infrastructure.persistence.entity.WorkspaceEntity;
import com.evido.api.workspace.infrastructure.persistence.entity.WorkspaceMemberEntity;

import java.util.List;

public class WorkspaceMapper {

    private WorkspaceMapper() {}

    public static WorkspaceEntity toEntity(Workspace domain) {
        return new WorkspaceEntity(domain.getName());
    }

    public static List<WorkspaceMemberEntity> toMemberEntities(
            Workspace domain,
            WorkspaceEntity workspaceEntity
    ) {
        return domain.getMembers()
                .stream()
                .map(m -> {
                    WorkspaceMemberEntity entity =
                            new WorkspaceMemberEntity(
                                    m.getUserId(),
                                    m.getRole()
                            );

                    entity.setWorkspace(workspaceEntity);
                    return entity;
                })
                .toList();
    }

    public static Workspace toDomain(WorkspaceEntity entity) {
        return toDomain(entity, entity.getMembers());
    }

    public static Workspace toDomain(
            WorkspaceEntity entity,
            List<WorkspaceMemberEntity> members
    ) {
        Workspace workspace = new Workspace(
                entity.getId(),
                entity.getName(),
                entity.getCreatedAt()
        );

        members.forEach(m ->
                workspace.addMember(
                        new WorkspaceMember(
                                m.getUserId(),
                                entity.getId(),
                                m.getRole(),
                                m.getJoinedAt()
                        )
                )
        );

        return workspace;
    }
}