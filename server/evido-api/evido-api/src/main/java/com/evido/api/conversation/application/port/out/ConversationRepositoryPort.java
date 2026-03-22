package com.evido.api.conversation.application.port.out;

import com.evido.api.conversation.domain.Conversation;

import java.util.List;

public interface ConversationRepositoryPort {

    List<Conversation> findByWorkspaceId(Long workspaceId);

    Conversation createDefaultConversation(Long workspaceId);
}