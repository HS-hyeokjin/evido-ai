package com.evido.api.conversation.api.controller;

import com.evido.api.auth.infrastructure.security.CurrentUserProvider;
import com.evido.api.conversation.api.dto.response.ConversationResponse;
import com.evido.api.conversation.api.mapper.MessageResponseMapper;
import com.evido.api.conversation.api.mapper.SendMessageResponseMapper;
import com.evido.api.conversation.application.port.in.command.CreateConversationCommand;
import com.evido.api.conversation.application.port.in.command.SendFirstMessageCommand;
import com.evido.api.conversation.application.port.in.command.SendMessageCommand;
import com.evido.api.conversation.application.port.in.query.GetConversationsQuery;
import com.evido.api.conversation.api.dto.request.MessageRequest;
import com.evido.api.conversation.api.dto.response.MessageResponse;
import com.evido.api.conversation.api.dto.response.SendMessageResponse;
import com.evido.api.conversation.api.mapper.ConversationResponseMapper;
import com.evido.api.conversation.application.port.in.ConversationUseCase;
import com.evido.api.conversation.application.port.in.MessageUseCase;
import com.evido.api.conversation.application.port.in.query.GetMessagesQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationUseCase conversationUseCase;
    private final MessageUseCase messageUseCase;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/{workspaceId}/conversations")
    public List<ConversationResponse> getConversation(@PathVariable Long workspaceId, Authentication authentication) {

        String userId = currentUserProvider.getUserId(authentication);

        var query = new GetConversationsQuery(workspaceId, userId);

        return conversationUseCase.getConversation(query)
                .stream()
                .map(ConversationResponseMapper::from)
                .toList();
    }

    @PostMapping("/{workspaceId}/conversations")
    public ConversationResponse createConversation(@PathVariable Long workspaceId, Authentication authentication) {

        String userId = currentUserProvider.getUserId(authentication);

        var command = new CreateConversationCommand(
                workspaceId,
                userId
        );

        return ConversationResponseMapper.from(
                conversationUseCase.createConversation(command)
        );
    }

    @GetMapping("/{conversationId}/messages")
    public List<MessageResponse> getMessages(
            @PathVariable Long conversationId,
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var query = new GetMessagesQuery(conversationId, userId);

        return messageUseCase.getMessages(query)
                .stream()
                .map(MessageResponseMapper::from)
                .toList();
    }

    @PostMapping("/{conversationId}/messages")
    public Mono<SendMessageResponse> sendMessage(
            @PathVariable Long conversationId,
            @RequestBody MessageRequest request,
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var command = new SendMessageCommand(
                conversationId,
                userId,
                request.content()
        );

        return messageUseCase.sendMessage(command)
                .map(SendMessageResponseMapper::from);
    }

    @PostMapping("/workspaces/{workspaceId}/first-message")
    public Mono<SendMessageResponse> sendFirstMessage(
            @PathVariable Long workspaceId,
            @RequestBody MessageRequest request,
            Authentication authentication
    ) {
        String userId = currentUserProvider.getUserId(authentication);

        var command = new SendFirstMessageCommand(
                workspaceId,
                userId,
                request.content()
        );

        return messageUseCase.sendFirstMessage(command)
                .map(SendMessageResponseMapper::from);
    }
}