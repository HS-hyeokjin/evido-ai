package com.evido.api.conversation.application.service;

import com.evido.api.conversation.application.port.in.ConversationUseCase;
import com.evido.api.conversation.application.port.in.command.CreateConversationCommand;
import com.evido.api.conversation.application.port.in.command.DeleteConversationCommand;
import com.evido.api.conversation.application.port.in.command.UpdateConversationCommand;
import com.evido.api.conversation.application.port.in.query.GetConversationsQuery;
import com.evido.api.conversation.application.port.out.ConversationRepositoryPort;
import com.evido.api.conversation.application.port.out.WorkspaceAccessPort;
import com.evido.api.conversation.domain.Conversation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConversationService implements ConversationUseCase {

    private final ConversationRepositoryPort conversationRepositoryPort;
    private final WorkspaceAccessPort workspaceAccessPort;

    @Override
    public List<Conversation> getConversation(GetConversationsQuery query) {
        validateWorkspaceAccess(query.workspaceId(), query.userId());
        return conversationRepositoryPort.findByWorkspaceId(query.workspaceId());
    }

    @Override
    @Transactional
    public Conversation createConversation(CreateConversationCommand command) {
        validateWorkspaceAccess(command.workspaceId(), command.userId());
        return conversationRepositoryPort.createDefaultConversation(command.workspaceId());
    }

    @Override
    @Transactional
    public Conversation updateConversation(UpdateConversationCommand command) {
        Conversation conversation = conversationRepositoryPort.findById(command.conversationId())
                .orElseThrow(() -> new IllegalArgumentException("대화를 찾을 수 없습니다."));

        validateWorkspaceAccess(conversation.getWorkspaceId(), command.userId());

        conversation.rename(command.title());

        return conversationRepositoryPort.updateTitle(
                conversation.getId(),
                conversation.getTitle()
        );
    }

    @Override
    @Transactional
    public void deleteConversation(DeleteConversationCommand command) {
        Conversation conversation = conversationRepositoryPort.findById(command.conversationId())
                .orElseThrow(() -> new IllegalArgumentException("대화를 찾을 수 없습니다."));

        validateWorkspaceAccess(conversation.getWorkspaceId(), command.userId());

        conversationRepositoryPort.deleteById(conversation.getId());
    }

    private void validateWorkspaceAccess(Long workspaceId, String userId) {
        if (!workspaceAccessPort.hasAccess(workspaceId, userId)) {
            throw new RuntimeException("워크스페이스 접근 권한이 없습니다.");
        }
    }
}