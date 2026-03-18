package com.evido.api.workspace.infrastructure.persistence;

import com.evido.api.workspace.application.port.out.WorkspaceRepositoryPort;
import com.evido.api.workspace.domain.Workspace;
import com.evido.api.workspace.infrastructure.persistence.entity.WorkspaceEntity;
import com.evido.api.workspace.infrastructure.persistence.entity.WorkspaceMemberEntity;
import com.evido.api.workspace.infrastructure.persistence.mapper.WorkspaceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class WorkspaceRepositoryAdapter implements WorkspaceRepositoryPort {

    private final WorkspaceJpaRepository workspaceJpaRepository;
    private final WorkspaceMemberJpaRepository memberJpaRepository;

    @Override
    public Workspace save(Workspace workspace) {

        WorkspaceEntity entity = WorkspaceMapper.toEntity(workspace);

        WorkspaceEntity saved = workspaceJpaRepository.save(entity);

        List<WorkspaceMemberEntity> members =
                WorkspaceMapper.toMemberEntities(workspace, saved);

        memberJpaRepository.saveAll(members);

        return WorkspaceMapper.toDomain(saved, members);
    }

    @Override
    public Optional<Workspace> findById(Long id) {

        return workspaceJpaRepository.findById(id)
                .map(entity -> {

                    List<WorkspaceMemberEntity> members =
                            memberJpaRepository.findByWorkspace_Id(entity.getId());

                    return WorkspaceMapper.toDomain(entity, members);
                });
    }

    @Override
    public List<Workspace> findAllByUserId(String userId) {

        List<WorkspaceMemberEntity> memberships =
                memberJpaRepository.findByUserId(userId);

        List<Long> workspaceIds = memberships.stream()
                .map(m -> m.getWorkspace().getId())
                .distinct()
                .toList();

        List<WorkspaceEntity> workspaces =
                workspaceJpaRepository.findAllById(workspaceIds);

        return workspaces.stream()
                .map(workspace -> {

                    List<WorkspaceMemberEntity> members =
                            memberships.stream()
                                    .filter(m -> m.getWorkspace().getId().equals(workspace.getId()))
                                    .toList();

                    return WorkspaceMapper.toDomain(workspace, members);
                })
                .toList();
    }
}