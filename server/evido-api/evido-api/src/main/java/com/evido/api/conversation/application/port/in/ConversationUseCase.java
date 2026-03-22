package com.evido.api.conversation.application.port.in;

import com.evido.api.conversation.domain.Conversation;

import java.util.List;

public interface ConversationUseCase {

    List<Conversation> getConversation(Long workspaceId);

    Conversation createConversation(Long workspaceId);
}