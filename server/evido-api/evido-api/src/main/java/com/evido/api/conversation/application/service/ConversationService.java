package com.evido.api.conversation.application.service;

import com.evido.api.conversation.application.port.in.ConversationUseCase;
import com.evido.api.conversation.application.port.in.command.CreateConversationCommand;
import com.evido.api.conversation.application.port.in.query.GetConversationsQuery;
import com.evido.api.conversation.application.port.out.ConversationRepositoryPort;
import com.evido.api.conversation.application.port.out.WorkspaceAccessPort;
import com.evido.api.conversation.domain.Conversation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService implements ConversationUseCase {

    private final ConversationRepositoryPort conversationRepositoryPort;
    private final WorkspaceAccessPort workspaceAccessPort;

    @Override
    public List<Conversation> getConversation(GetConversationsQuery query) {
        validateAccess(query.workspaceId(), query.userId());
        return conversationRepositoryPort.findByWorkspaceId(query.workspaceId());
    }

    @Override
    public Conversation createConversation(CreateConversationCommand command) {
        validateAccess(command.workspaceId(), command.userId());
        return conversationRepositoryPort.createDefaultConversation(command.workspaceId());
    }

    private void validateAccess(Long workspaceId, String userId) {
        if (!workspaceAccessPort.hasAccess(workspaceId, userId)) {
            throw new RuntimeException("워크스페이스 접근 권한이 없습니다.");
        }
    }
}