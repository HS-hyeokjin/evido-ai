package com.evido.api.conversation.application.port.out;

import com.evido.api.conversation.domain.Conversation;

import java.util.List;
import java.util.Optional;

public interface ConversationRepositoryPort {

    List<Conversation> findByWorkspaceId(Long workspaceId);

    Conversation createDefaultConversation(Long workspaceId);

    Conversation save(Conversation conversation);

    Optional<Conversation> findById(Long conversationId);

    Conversation updateTitle(Long conversationId, String title);

    void deleteById(Long conversationId);

}