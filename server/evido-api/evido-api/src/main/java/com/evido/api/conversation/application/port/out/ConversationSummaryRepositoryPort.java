package com.evido.api.conversation.application.port.out;

import com.evido.api.conversation.domain.ConversationSummary;

import java.util.Optional;

public interface ConversationSummaryRepositoryPort {

    Optional<ConversationSummary> findByConversationId(Long conversationId);

    ConversationSummary save(ConversationSummary conversationSummary);
}