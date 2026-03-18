package com.evido.api.chat.application.port.out;

import com.evido.api.chat.domain.Chat;

import java.util.List;

public interface ChatRepositoryPort {

    List<Chat> findByWorkspaceId(Long workspaceId);

    Chat createDefaultChat(Long workspaceId);
}