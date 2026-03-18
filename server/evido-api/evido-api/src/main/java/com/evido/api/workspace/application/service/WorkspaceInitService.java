package com.evido.api.workspace.application.service;

import com.evido.api.chat.application.port.out.ChatRepositoryPort;
import com.evido.api.workspace.application.dto.WorkspaceInitResult;
import com.evido.api.workspace.application.port.in.WorkspaceInitUseCase;
import com.evido.api.workspace.application.port.out.WorkspaceRepositoryPort;
import com.evido.api.workspace.application.port.out.WorkspaceMemberRepositoryPort;
import com.evido.api.workspace.domain.Workspace;
import com.evido.api.chat.domain.Chat;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceInitService implements WorkspaceInitUseCase {

    private final WorkspaceRepositoryPort workspaceRepository;
    private final ChatRepositoryPort chatRepository;

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

        List<Chat> chats = chatRepository.findByWorkspaceId(workspace.getId());

        Chat chat = chats.isEmpty()
                ? chatRepository.createDefaultChat(workspace.getId())
                : chats.get(0);

        return new WorkspaceInitResult(
                workspace.getId(),
                chat.getId()
        );
    }
}