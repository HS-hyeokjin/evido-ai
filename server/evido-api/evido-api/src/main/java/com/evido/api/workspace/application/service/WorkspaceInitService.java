package com.evido.api.workspace.application.service;

import com.evido.api.document.application.port.in.DefaultDocumentProvisionUseCase;
import com.evido.api.workspace.application.dto.WorkspaceInitResult;
import com.evido.api.workspace.application.port.in.WorkspaceInitUseCase;
import com.evido.api.workspace.application.port.out.WorkspaceRepositoryPort;
import com.evido.api.workspace.domain.Workspace;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceInitService implements WorkspaceInitUseCase {

    private final WorkspaceRepositoryPort workspaceRepository;
    private final DefaultDocumentProvisionUseCase defaultDocumentProvisionUseCase;

    @Override
    @Transactional
    public WorkspaceInitResult init(String userId) {

        List<Workspace> workspaces = workspaceRepository.findAllByUserId(userId);

        Workspace workspace;

        if (workspaces.isEmpty()) {
            workspace = workspaceRepository.save(
                    Workspace.create("기본 워크스페이스", userId)
            );

            defaultDocumentProvisionUseCase.provisionGuideForWorkspace(
                    workspace.getId(),
                    userId
            );
        } else {
            workspace = workspaces.get(0);
        }

        return new WorkspaceInitResult(workspace.getId());
    }
}