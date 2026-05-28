package com.evido.api.workspace.api.controller;

import com.evido.api.auth.infrastructure.security.CurrentUserProvider;
import com.evido.api.common.response.CommonResponse;
import com.evido.api.workspace.api.dto.request.WorkspaceCreateRequest;
import com.evido.api.workspace.api.dto.request.WorkspaceUpdateRequest;
import com.evido.api.workspace.api.dto.response.WorkspaceResponse;
import com.evido.api.workspace.api.mapper.WorkspaceResponseMapper;
import com.evido.api.workspace.application.dto.WorkspaceResult;
import com.evido.api.workspace.application.port.in.WorkspaceUseCase;
import com.evido.api.workspace.application.port.in.command.WorkspaceCreateCommand;
import com.evido.api.workspace.application.port.in.command.WorkspaceDeleteCommand;
import com.evido.api.workspace.application.port.in.command.WorkspaceUpdateCommand;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Workspace", description = "워크스페이스 생성, 조회, 수정, 삭제 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceUseCase workspaceUseCase;
    private final CurrentUserProvider currentUserProvider;

    @Operation(summary = "워크스페이스 생성")
    @PostMapping
    public CommonResponse<WorkspaceResponse> create(
            @RequestBody WorkspaceCreateRequest request,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        String name = (request.name() == null || request.name().isBlank())
                ? "새 워크스페이스"
                : request.name().trim();

        WorkspaceCreateCommand command = new WorkspaceCreateCommand(
                userId,
                name
        );

        WorkspaceResult result = workspaceUseCase.create(command);
        WorkspaceResponse response = WorkspaceResponseMapper.from(result);

        return CommonResponse.success("워크스페이스가 생성되었습니다.", response);
    }

    @Operation(summary = "워크스페이스 목록 조회")
    @GetMapping
    public CommonResponse<List<WorkspaceResponse>> list(
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        List<WorkspaceResponse> response = workspaceUseCase.findAll(userId)
                .stream()
                .map(WorkspaceResponseMapper::from)
                .toList();

        return CommonResponse.success(response);
    }

    @Operation(summary = "워크스페이스 수정")
    @PatchMapping("/{workspaceId}")
    public CommonResponse<WorkspaceResponse> update(
            @PathVariable Long workspaceId,
            @RequestBody WorkspaceUpdateRequest request,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        WorkspaceUpdateCommand command = new WorkspaceUpdateCommand(
                workspaceId,
                userId,
                request.name()
        );

        WorkspaceResult result = workspaceUseCase.update(command);
        WorkspaceResponse response = WorkspaceResponseMapper.from(result);

        return CommonResponse.success("워크스페이스가 수정되었습니다.", response);
    }

    @Operation(summary = "워크스페이스 삭제")
    @DeleteMapping("/{workspaceId}")
    public CommonResponse<Void> delete(
            @PathVariable Long workspaceId,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        WorkspaceDeleteCommand command = new WorkspaceDeleteCommand(
                workspaceId,
                userId
        );

        workspaceUseCase.delete(command);

        return CommonResponse.<Void>success("워크스페이스가 삭제되었습니다.", null);
    }
}