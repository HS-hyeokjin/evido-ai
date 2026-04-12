package com.evido.api.workspace.application.service;

import com.evido.api.workspace.application.dto.WorkspaceResult;
import com.evido.api.workspace.application.port.in.WorkspaceUseCase;
import com.evido.api.workspace.application.port.in.command.WorkspaceCreateCommand;
import com.evido.api.workspace.application.port.in.command.WorkspaceDeleteCommand;
import com.evido.api.workspace.application.port.in.command.WorkspaceUpdateCommand;
import com.evido.api.workspace.application.port.out.WorkspaceRepositoryPort;
import com.evido.api.workspace.domain.Workspace;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceService implements WorkspaceUseCase {

    private final WorkspaceRepositoryPort workspaceRepositoryPort;

    @Override
    public WorkspaceResult create(WorkspaceCreateCommand command) {

        Workspace workspace = Workspace.create(
                command.name(),
                command.userId()
        );

        Workspace saved = workspaceRepositoryPort.save(workspace);

        return new WorkspaceResult(
                saved.getId(),
                saved.getName(),
                saved.getCreatedAt()
        );
    }

    @Override
    public List<WorkspaceResult> findAll(String userId) {
        return workspaceRepositoryPort.findAllByUserId(userId)
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

        Workspace workspace = workspaceRepositoryPort.findById(workspaceId)
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
    @Override
    @Transactional
    public WorkspaceResult update(WorkspaceUpdateCommand command) {
        Workspace workspace = workspaceRepositoryPort.findByIdWithMembers(command.workspaceId())
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));

        validateOwner(workspace, command.userId());

        workspace.rename(command.name());

        Workspace updatedWorkspace = workspaceRepositoryPort.updateName(
                workspace.getId(),
                workspace.getName()
        );

        return WorkspaceResult.from(updatedWorkspace);
    }

    @Override
    @Transactional
    public void delete(WorkspaceDeleteCommand command) {
        Workspace workspace = workspaceRepositoryPort.findByIdWithMembers(command.workspaceId())
                .orElseThrow(() -> new IllegalArgumentException("워크스페이스를 찾을 수 없습니다."));

        validateOwner(workspace, command.userId());

        workspaceRepositoryPort.deleteById(workspace.getId());
    }

    private void validateOwner(Workspace workspace, String userId) {
        if (!workspace.isOwner(userId)) {
            throw new IllegalStateException("워크스페이스 소유자만 수정/삭제할 수 있습니다.");
        }
    }

    private String normalizeCreateName(String name) {
        if (name == null || name.isBlank()) {
            return "새 워크스페이스";
        }
        return name.trim();
    }
}