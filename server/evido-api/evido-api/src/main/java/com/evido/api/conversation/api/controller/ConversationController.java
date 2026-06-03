package com.evido.api.conversation.api.controller;

import com.evido.api.auth.infrastructure.security.CurrentUserProvider;
import com.evido.api.common.response.CommonResponse;
import com.evido.api.conversation.api.dto.request.ConversationUpdateRequest;
import com.evido.api.conversation.api.dto.response.ConversationResponse;
import com.evido.api.conversation.api.mapper.ConversationResponseMapper;
import com.evido.api.conversation.application.port.in.ConversationUseCase;
import com.evido.api.conversation.application.port.in.command.CreateConversationCommand;
import com.evido.api.conversation.application.port.in.command.DeleteConversationCommand;
import com.evido.api.conversation.application.port.in.command.UpdateConversationCommand;
import com.evido.api.conversation.application.port.in.query.GetConversationsQuery;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Conversation", description = "대화 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationUseCase conversationUseCase;
    private final CurrentUserProvider currentUserProvider;

    @Operation(summary = "대화 목록 조회")
    @GetMapping("/{workspaceId}/conversations")
    public CommonResponse<List<ConversationResponse>> getConversation(
            @PathVariable Long workspaceId,
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var query = new GetConversationsQuery(workspaceId, userId);

        List<ConversationResponse> response = conversationUseCase.getConversation(query)
                .stream()
                .map(ConversationResponseMapper::from)
                .toList();

        return CommonResponse.success(response);
    }

    @Operation(summary = "대화 생성")
    @PostMapping("/{workspaceId}/conversations")
    public CommonResponse<ConversationResponse> createConversation(
            @PathVariable Long workspaceId,
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var command = new CreateConversationCommand(workspaceId, userId);

        ConversationResponse response = ConversationResponseMapper.from(
                conversationUseCase.createConversation(command)
        );

        return CommonResponse.success("대화가 생성되었습니다.", response);
    }

    @Operation(summary = "대화 이름 수정")
    @PatchMapping("/{conversationId}")
    public CommonResponse<ConversationResponse> updateConversation(
            @PathVariable Long conversationId,
            @RequestBody ConversationUpdateRequest request,
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var command = new UpdateConversationCommand(
                conversationId,
                userId,
                request.title()
        );

        ConversationResponse response = ConversationResponseMapper.from(
                conversationUseCase.updateConversation(command)
        );

        return CommonResponse.success("대화 이름이 수정되었습니다.", response);
    }

    @Operation(summary = "대화 삭제")
    @DeleteMapping("/{conversationId}")
    public CommonResponse<Void> deleteConversation(
            @PathVariable Long conversationId,
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var command = new DeleteConversationCommand(conversationId, userId);
        conversationUseCase.deleteConversation(command);

        return CommonResponse.<Void>success("대화가 삭제되었습니다.", null);
    }
}