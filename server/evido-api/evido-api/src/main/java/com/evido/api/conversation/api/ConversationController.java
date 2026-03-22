package com.evido.api.conversation.api;

import com.evido.api.conversation.application.port.in.ConversationUseCase;
import com.evido.api.conversation.domain.Conversation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workspaces")
public class ConversationController {

    private final ConversationUseCase conversationUseCase;

    @GetMapping("/{workspaceId}/conversations")
    public List<Conversation> getConversation(@PathVariable Long workspaceId) {
        return conversationUseCase.getConversation(workspaceId);
    }

    @PostMapping("/{workspaceId}/conversations")
    public Conversation createConversation(@PathVariable Long workspaceId) {
        return conversationUseCase.createConversation(workspaceId);
    }
}