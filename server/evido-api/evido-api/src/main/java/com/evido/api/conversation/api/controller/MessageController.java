package com.evido.api.conversation.api.controller;

import com.evido.api.auth.infrastructure.security.CurrentUserProvider;
import com.evido.api.common.response.CommonResponse;
import com.evido.api.conversation.api.dto.request.MessageRequest;
import com.evido.api.conversation.api.dto.response.MessageResponse;
import com.evido.api.conversation.api.dto.response.SendMessageResponse;
import com.evido.api.conversation.api.mapper.MessageResponseMapper;
import com.evido.api.conversation.api.mapper.SendMessageResponseMapper;
import com.evido.api.conversation.application.port.in.MessageUseCase;
import com.evido.api.conversation.application.port.in.command.SendFirstMessageCommand;
import com.evido.api.conversation.application.port.in.command.SendMessageCommand;
import com.evido.api.conversation.application.port.in.query.GetMessagesQuery;
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
import reactor.core.publisher.Mono;

import java.util.List;

@Tag(name = "Message", description = "메시지 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/conversations")
public class MessageController {

    private final MessageUseCase messageUseCase;
    private final CurrentUserProvider currentUserProvider;

    @Operation(
            summary = "메시지 목록 조회",
            description = "특정 대화의 메시지 목록을 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "메시지 목록 조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = MessageResponse.class)))
            ),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "대화를 찾을 수 없음")
    })
    @GetMapping("/{conversationId}/messages")
    public CommonResponse<List<MessageResponse>> getMessages(
            @Parameter(description = "대화 ID", example = "10")
            @PathVariable Long conversationId,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var query = new GetMessagesQuery(conversationId, userId);

        List<MessageResponse> response = messageUseCase.getMessages(query)
                .stream()
                .map(MessageResponseMapper::from)
                .toList();

        return CommonResponse.success(response);
    }

    @Operation(
            summary = "메시지 전송",
            description = "기존 대화에 메시지를 전송하고 AI 응답을 받습니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "메시지 전송 성공",
                    content = @Content(schema = @Schema(implementation = SendMessageResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "대화를 찾을 수 없음")
    })
    @PostMapping("/{conversationId}/messages")
    public Mono<CommonResponse<SendMessageResponse>> sendMessage(
            @Parameter(description = "대화 ID", example = "10")
            @PathVariable Long conversationId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "사용자가 전송할 메시지",
                    required = true
            )
            @RequestBody MessageRequest request,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var command = new SendMessageCommand(
                conversationId,
                userId,
                request.content()
        );

        return messageUseCase.sendMessage(command)
                .map(SendMessageResponseMapper::from)
                .map(response -> CommonResponse.success(
                        "메시지 전송이 완료되었습니다.",
                        response
                ));
    }

    @Operation(
            summary = "첫 메시지 전송",
            description = "워크스페이스에서 첫 메시지를 보내고 새 대화를 생성한 뒤 응답을 받습니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "첫 메시지 전송 성공",
                    content = @Content(schema = @Schema(implementation = SendMessageResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "403", description = "워크스페이스 접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음")
    })
    @PostMapping("/workspaces/{workspaceId}/first-message")
    public Mono<CommonResponse<SendMessageResponse>> sendFirstMessage(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "사용자가 처음 전송할 메시지",
                    required = true
            )
            @RequestBody MessageRequest request,

            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var command = new SendFirstMessageCommand(
                workspaceId,
                userId,
                request.content()
        );

        return messageUseCase.sendFirstMessage(command)
                .map(SendMessageResponseMapper::from)
                .map(response -> CommonResponse.success(
                        "첫 메시지 전송이 완료되었습니다.",
                        response
                ));
    }
}