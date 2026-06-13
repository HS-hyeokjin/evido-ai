package com.evido.api.workspace.application.service;

import com.evido.api.common.exception.BusinessException;
import com.evido.api.common.exception.ErrorCode;
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
@Transactional(readOnly = true)
public class WorkspaceService implements WorkspaceUseCase {

    private final WorkspaceRepositoryPort workspaceRepositoryPort;

    @Override
    @Transactional
    public WorkspaceResult create(WorkspaceCreateCommand command) {
        String name = normalizeCreateName(command.name());

        Workspace workspace = Workspace.create(
                name,
                command.userId()
        );

        Workspace saved = workspaceRepositoryPort.save(workspace);

        return WorkspaceResult.from(saved);
    }

    @Override
    public List<WorkspaceResult> findAll(String userId) {
        return workspaceRepositoryPort.findAllByUserId(userId)
                .stream()
                .map(WorkspaceResult::from)
                .toList();
    }

    @Override
    public WorkspaceResult findById(Long workspaceId, String userId) {
        Workspace workspace = getWorkspaceWithMembers(workspaceId);

        validateMember(workspace, userId);

        return WorkspaceResult.from(workspace);
    }

    @Override
    @Transactional
    public WorkspaceResult update(WorkspaceUpdateCommand command) {
        Workspace workspace = getWorkspaceWithMembers(command.workspaceId());

        validateOwner(workspace, command.userId());

        String name = normalizeUpdateName(command.name());

        workspace.rename(name);

        Workspace updatedWorkspace = workspaceRepositoryPort.updateName(
                workspace.getId(),
                workspace.getName()
        );

        return WorkspaceResult.from(updatedWorkspace);
    }

    @Override
    @Transactional
    public void delete(WorkspaceDeleteCommand command) {
        Workspace workspace = getWorkspaceWithMembers(command.workspaceId());

        validateOwner(workspace, command.userId());

        workspaceRepositoryPort.deleteById(workspace.getId());
    }

    private Workspace getWorkspaceWithMembers(Long workspaceId) {
        return workspaceRepositoryPort.findByIdWithMembers(workspaceId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.WORKSPACE_NOT_FOUND)
                );
    }

    private void validateMember(Workspace workspace, String userId) {
        if (!workspace.isMember(userId)) {
            throw new BusinessException(ErrorCode.WORKSPACE_ACCESS_DENIED);
        }
    }

    private void validateOwner(Workspace workspace, String userId) {
        if (!workspace.isOwner(userId)) {
            throw new BusinessException(
                    ErrorCode.WORKSPACE_ACCESS_DENIED,
                    "워크스페이스 소유자만 수정/삭제할 수 있습니다."
            );
        }
    }

    private String normalizeCreateName(String name) {
        if (name == null || name.isBlank()) {
            return "새 워크스페이스";
        }

        return name.trim();
    }

    private String normalizeUpdateName(String name) {
        if (name == null || name.isBlank()) {
            throw new BusinessException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "워크스페이스 이름은 비어 있을 수 없습니다."
            );
        }

        return name.trim();
    }
}