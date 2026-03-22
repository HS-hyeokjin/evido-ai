package com.evido.api.workspace.application.service;

import com.evido.api.conversation.application.port.out.ConversationRepositoryPort;
import com.evido.api.workspace.application.dto.WorkspaceInitResult;
import com.evido.api.workspace.application.port.in.WorkspaceInitUseCase;
import com.evido.api.workspace.application.port.out.WorkspaceRepositoryPort;
import com.evido.api.workspace.domain.Workspace;
import com.evido.api.conversation.domain.Conversation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceInitService implements WorkspaceInitUseCase {

    private final WorkspaceRepositoryPort workspaceRepository;
    private final ConversationRepositoryPort conversationRepository;

    @Override
    public WorkspaceInitResult init(String userId) {

        List<Workspace> workspaces = workspaceRepository.findAllByUserId(userId);

        Workspace workspace;

        if (workspaces.isEmpty()) {
            workspace = workspaceRepository.save(
                    Workspace.create("기본 워크스페이스", userId)
            );
        } else {
            workspace = workspaces.get(0);
        }

        List<Conversation> conversations = conversationRepository.findByWorkspaceId(workspace.getId());

        Conversation conversation = conversations.isEmpty()
                ? conversationRepository.createDefaultConversation(workspace.getId())
                : conversations.get(0);

        return new WorkspaceInitResult(
                workspace.getId(),
                conversation.getId()
        );
    }
}