package com.evido.api.conversation.application.port.out;

import com.evido.api.conversation.domain.Message;

import java.util.List;

public interface MessageRepositoryPort {

    Message save(Message message);

    List<Message> findByConversationId(Long conversationId);
}