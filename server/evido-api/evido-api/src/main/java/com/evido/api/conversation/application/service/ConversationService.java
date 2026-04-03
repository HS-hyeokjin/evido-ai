package com.evido.api.conversation.application.service;

import com.evido.api.conversation.application.port.in.ConversationUseCase;
import com.evido.api.conversation.application.port.in.command.CreateConversationCommand;
import com.evido.api.conversation.application.port.in.query.GetConversationsQuery;
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
    public List<Conversation> getConversation(GetConversationsQuery query) {
        return conversationRepositoryPort.findByWorkspaceId(query.workspaceId());
    }

    @Override
    public Conversation createConversation(CreateConversationCommand command) {

        return conversationRepositoryPort.createDefaultConversation(command.workspaceId());
    }
}