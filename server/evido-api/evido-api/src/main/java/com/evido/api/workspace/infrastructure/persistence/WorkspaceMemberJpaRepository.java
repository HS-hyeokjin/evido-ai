package com.evido.api.workspace.infrastructure.persistence;

import com.evido.api.workspace.infrastructure.persistence.entity.WorkspaceMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceMemberJpaRepository extends JpaRepository<WorkspaceMemberEntity, Long> {

    List<WorkspaceMemberEntity> findByUserId(String userId);

    List<WorkspaceMemberEntity> findByWorkspace_Id(Long workspaceId);

    boolean existsByWorkspaceIdAndUserId(Long workspaceId, String userId);
}