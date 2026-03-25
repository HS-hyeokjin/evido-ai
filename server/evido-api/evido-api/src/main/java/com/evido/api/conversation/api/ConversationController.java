package com.evido.api.conversation.api;

import com.evido.api.conversation.api.dto.MessageRequest;
import com.evido.api.conversation.api.dto.MessageResponse;
import com.evido.api.conversation.api.dto.SendMessageResponse;
import com.evido.api.conversation.application.port.in.ConversationUseCase;
import com.evido.api.conversation.application.port.in.MessageUseCase;
import com.evido.api.conversation.domain.Conversation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationUseCase conversationUseCase;
    private final MessageUseCase messageUseCase;

    @GetMapping("/{workspaceId}/conversations")
    public List<Conversation> getConversation(@PathVariable Long workspaceId) {
        return conversationUseCase.getConversation(workspaceId);
    }

    @PostMapping("/{workspaceId}/conversations")
    public Conversation createConversation(@PathVariable Long workspaceId) {
        return conversationUseCase.createConversation(workspaceId);
    }

    @GetMapping("/{conversationId}/messages")
    public List<MessageResponse> getMessages(@PathVariable Long conversationId) {
        return messageUseCase.getMessages(conversationId);
    }

    @PostMapping("/{conversationId}/messages")
    public Mono<SendMessageResponse> sendMessage(
            @PathVariable Long conversationId,
            @RequestBody MessageRequest request
    ) {
        return messageUseCase.sendMessage(conversationId, request);
    }
}