package com.evido.api.workspace.application.port.out;

import com.evido.api.workspace.domain.WorkspaceMember;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkspaceMemberRepositoryPort {

    void saveAll(List<WorkspaceMember> members);

    List<WorkspaceMember> findByWorkspaceId(Long workspaceId);

    boolean existsByWorkspaceIdAndUserId(Long workspaceId, String userId);
}