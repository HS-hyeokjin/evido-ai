package com.evido.api.conversation.application.service;

import com.evido.api.conversation.application.port.in.ConversationUseCase;
import com.evido.api.conversation.application.port.out.ConversationRepositoryPort;
import com.evido.api.conversation.domain.Conversation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService implements ConversationUseCase {

    private final ConversationRepositoryPort conversationRepositoryPort;

    @Override
    public List<Conversation> getConversation(Long workspaceId) {
        return conversationRepositoryPort.findByWorkspaceId(workspaceId);
    }

    @Override
    public Conversation createConversation(Long workspaceId) {

        return conversationRepositoryPort.createDefaultConversation(workspaceId);
    }
}