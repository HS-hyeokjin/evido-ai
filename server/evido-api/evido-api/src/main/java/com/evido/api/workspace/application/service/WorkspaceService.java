package com.evido.api.workspace.application.service;

import com.evido.api.workspace.application.dto.*;
import com.evido.api.workspace.application.port.in.WorkspaceUseCase;
import com.evido.api.workspace.application.port.out.WorkspaceRepositoryPort;
import com.evido.api.workspace.domain.Workspace;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class WorkspaceService implements WorkspaceUseCase {

    private final WorkspaceRepositoryPort workspaceRepository;

    @Override
    public WorkspaceResult create(WorkspaceCreateCommand command) {

        Workspace workspace = Workspace.create(
                command.name(),
                command.userId()
        );

        Workspace saved = workspaceRepository.save(workspace);

        return new WorkspaceResult(
                saved.getId(),
                saved.getName(),
                saved.getCreatedAt()
        );
    }

    @Override
    public List<WorkspaceResult> findAll(String userId) {
        return workspaceRepository.findAllByUserId(userId)
                .stream()
                .map(w -> new WorkspaceResult(
                        w.getId(),
                        w.getName(),
                        w.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public WorkspaceResult findById(Long workspaceId, String userId) {

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("워크스페이스 없음"));

        if (!workspace.isMember(userId)) {
            throw new RuntimeException("접근 권한 없음");
        }

        return new WorkspaceResult(
                workspace.getId(),
                workspace.getName(),
                workspace.getCreatedAt()
        );
    }
}