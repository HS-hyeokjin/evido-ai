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
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    @Operation(
            summary = "워크스페이스 생성",
            description = "새 워크스페이스를 생성합니다. 이름이 없으면 기본값으로 생성됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "워크스페이스 생성 성공",
                    content = @Content(schema = @Schema(implementation = WorkspaceResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })

    @PostMapping
    public CommonResponse<WorkspaceResponse> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "워크스페이스 생성 요청",
                    required = true
            )
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

    @Operation(
            summary = "워크스페이스 목록 조회",
            description = "현재 사용자가 접근 가능한 워크스페이스 목록을 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "워크스페이스 목록 조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = WorkspaceResponse.class)))
            ),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })

    @GetMapping
    public CommonResponse<List<WorkspaceResponse>> list(
            @Parameter(hidden = true) Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        List<WorkspaceResponse> response = workspaceUseCase.findAll(userId)
                .stream()
                .map(WorkspaceResponseMapper::from)
                .toList();

        return CommonResponse.success(response);
    }

    @Operation(
            summary = "워크스페이스 수정",
            description = "워크스페이스 이름을 수정합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "워크스페이스 수정 성공",
                    content = @Content(schema = @Schema(implementation = WorkspaceResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @PatchMapping("/{workspaceId}")
    public CommonResponse<WorkspaceResponse> update(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "워크스페이스 수정 요청",
                    required = true
            )
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

    @Operation(
            summary = "워크스페이스 삭제",
            description = "워크스페이스를 삭제합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "워크스페이스 삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @DeleteMapping("/{workspaceId}")
    public CommonResponse<Void> delete(
            @Parameter(description = "워크스페이스 ID", example = "1")
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