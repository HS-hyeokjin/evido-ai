package com.evido.api.workspace.api.controller;

import com.evido.api.auth.infrastructure.security.CurrentUserProvider;
import com.evido.api.common.response.CommonResponse;
import com.evido.api.workspace.api.dto.response.WorkspaceInitResponse;
import com.evido.api.workspace.api.mapper.WorkspaceInitResponseMapper;
import com.evido.api.workspace.application.dto.WorkspaceInitResult;
import com.evido.api.workspace.application.port.in.WorkspaceInitUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Workspace", description = "워크스페이스 초기화 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workspaces")
public class WorkspaceInitController {

    private final WorkspaceInitUseCase workspaceInitUseCase;
    private final CurrentUserProvider currentUserProvider;

    @Operation(summary = "워크스페이스 초기화")
    @GetMapping("/init")
    public CommonResponse<WorkspaceInitResponse> init(
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        WorkspaceInitResult result = workspaceInitUseCase.init(userId);
        WorkspaceInitResponse response = WorkspaceInitResponseMapper.from(result);

        return CommonResponse.success(response);
    }
}