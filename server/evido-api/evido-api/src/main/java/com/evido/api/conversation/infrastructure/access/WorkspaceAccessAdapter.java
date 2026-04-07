package com.evido.api.conversation.infrastructure.access;

import com.evido.api.conversation.application.port.out.WorkspaceAccessPort;
import com.evido.api.workspace.infrastructure.persistence.WorkspaceMemberJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkspaceAccessAdapter implements WorkspaceAccessPort {

    private final WorkspaceMemberJpaRepository workspaceMemberJpaRepository;

    @Override
    public boolean hasAccess(Long workspaceId, String userId) {
        return workspaceMemberJpaRepository.existsByWorkspaceIdAndUserId(workspaceId, userId);
    }
}