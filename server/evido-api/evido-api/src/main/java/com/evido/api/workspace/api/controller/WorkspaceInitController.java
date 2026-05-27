package com.evido.api.workspace.api.controller;

import com.evido.api.auth.infrastructure.security.CurrentUserProvider;
import com.evido.api.common.response.CommonResponse;
import com.evido.api.workspace.api.dto.response.WorkspaceInitResponse;
import com.evido.api.workspace.api.mapper.WorkspaceInitResponseMapper;
import com.evido.api.workspace.application.dto.WorkspaceInitResult;
import com.evido.api.workspace.application.port.in.WorkspaceInitUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    @Operation(
            summary = "워크스페이스 초기화",
            description = "사용자의 첫 진입 시 기본 워크스페이스를 조회하고, 없으면 생성합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "워크스페이스 초기화 성공",
                    content = @Content(schema = @Schema(implementation = WorkspaceInitResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
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