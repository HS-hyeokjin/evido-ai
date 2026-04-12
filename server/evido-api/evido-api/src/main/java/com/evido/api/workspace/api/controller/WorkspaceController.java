package com.evido.api.workspace.api.controller;

import com.evido.api.auth.infrastructure.security.CurrentUserProvider;
import com.evido.api.workspace.api.dto.request.WorkspaceCreateRequest;
import com.evido.api.workspace.api.dto.request.WorkspaceUpdateRequest;
import com.evido.api.workspace.api.dto.response.WorkspaceResponse;
import com.evido.api.workspace.api.mapper.WorkspaceResponseMapper;
import com.evido.api.workspace.application.dto.WorkspaceResult;
import com.evido.api.workspace.application.port.in.WorkspaceUseCase;
import com.evido.api.workspace.application.port.in.command.WorkspaceCreateCommand;
import com.evido.api.workspace.application.port.in.command.WorkspaceDeleteCommand;
import com.evido.api.workspace.application.port.in.command.WorkspaceUpdateCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceUseCase workspaceUseCase;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping
    public WorkspaceResponse create(
            @RequestBody WorkspaceCreateRequest request,
            Authentication authentication ) {
        String userId = currentUserProvider.getUserId(authentication);

        String name = (request.name() == null || request.name().isBlank())
                ? "새 워크스페이스"
                : request.name().trim();

        WorkspaceCreateCommand command = new WorkspaceCreateCommand(
                userId,
                name
        );

        WorkspaceResult result = workspaceUseCase.create(command);
        return WorkspaceResponseMapper.from(result);
    }

    @GetMapping
    public List<WorkspaceResponse> list(Authentication authentication) {
        String userId = currentUserProvider.getUserId(authentication);

        return workspaceUseCase.findAll(userId)
                .stream()
                .map(WorkspaceResponseMapper::from)
                .toList();
    }

    @PatchMapping("/{workspaceId}")
    public WorkspaceResponse update(
            @PathVariable Long workspaceId,
            @RequestBody WorkspaceUpdateRequest request,
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        WorkspaceUpdateCommand command = new WorkspaceUpdateCommand(
                workspaceId,
                userId,
                request.name()
        );

        WorkspaceResult result = workspaceUseCase.update(command);
        return WorkspaceResponseMapper.from(result);
    }

    @DeleteMapping("/{workspaceId}")
    public void delete(
            @PathVariable Long workspaceId,
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        WorkspaceDeleteCommand command = new WorkspaceDeleteCommand(
                workspaceId,
                userId
        );

        workspaceUseCase.delete(command);
    }
}