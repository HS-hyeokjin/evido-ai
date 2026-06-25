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
import com.evido.api.conversation.application.service.MessageStreamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Mono;

import java.util.List;

@Tag(name = "Message", description = "메시지 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/conversations")
public class MessageController {

    private final MessageUseCase messageUseCase;
    private final MessageStreamService messageStreamService;
    private final CurrentUserProvider currentUserProvider;

    @Operation(summary = "메시지 목록 조회")
    @GetMapping("/{conversationId}/messages")
    public CommonResponse<List<MessageResponse>> getMessages(
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

    @Operation(summary = "메시지 전송")
    @PostMapping("/{conversationId}/messages")
    public Mono<CommonResponse<SendMessageResponse>> sendMessage(
            @PathVariable Long conversationId,
            @Valid @RequestBody MessageRequest request,
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var command = new SendMessageCommand(
                conversationId,
                userId,
                request.content(),
                request.answerStyle(),
                request.evidenceMode()
        );

        return messageUseCase.sendMessage(command)
                .map(SendMessageResponseMapper::from)
                .map(response -> CommonResponse.success(
                        "메시지 전송이 완료되었습니다.",
                        response
                ));
    }

    @Operation(summary = "메시지 스트리밍 전송")
    @PostMapping(
            value = "/{conversationId}/messages/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter sendMessageStream(
            @PathVariable Long conversationId,
            @Valid @RequestBody MessageRequest request,
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var command = new SendMessageCommand(
                conversationId,
                userId,
                request.content(),
                request.answerStyle(),
                request.evidenceMode()
        );

        return messageStreamService.streamMessage(command);
    }

    @Operation(summary = "첫 메시지 전송")
    @PostMapping("/workspaces/{workspaceId}/first-message")
    public Mono<CommonResponse<SendMessageResponse>> sendFirstMessage(
            @PathVariable Long workspaceId,
            @Valid @RequestBody MessageRequest request,
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var command = new SendFirstMessageCommand(
                workspaceId,
                userId,
                request.content(),
                request.answerStyle(),
                request.evidenceMode()
        );

        return messageUseCase.sendFirstMessage(command)
                .map(SendMessageResponseMapper::from)
                .map(response -> CommonResponse.success(
                        "첫 메시지 전송이 완료되었습니다.",
                        response
                ));
    }

    @Operation(summary = "첫 메시지 스트리밍 전송")
    @PostMapping(
            value = "/workspaces/{workspaceId}/first-message/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter sendFirstMessageStream(
            @PathVariable Long workspaceId,
            @Valid @RequestBody MessageRequest request,
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var command = new SendFirstMessageCommand(
                workspaceId,
                userId,
                request.content(),
                request.answerStyle(),
                request.evidenceMode()
        );

        return messageStreamService.streamFirstMessage(command);
    }
}