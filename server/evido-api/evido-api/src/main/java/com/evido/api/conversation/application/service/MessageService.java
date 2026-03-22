package com.evido.api.conversation.application.service;

import com.evido.api.conversation.application.port.out.MessageRepositoryPort;
import com.evido.api.conversation.domain.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepositoryPort messageRepositoryPort;

    public Message saveUserMessage(Long conversationId, String content) {
        return messageRepositoryPort.save(
                Message.createUser(conversationId, content)
        );
    }

    public Message saveAssistantMessage(Long conversationId, String content) {
        return messageRepositoryPort.save(
                Message.createAssistant(conversationId, content)
        );
    }

    public List<Message> getMessages(Long conversationId) {
        return messageRepositoryPort.findByConversationId(conversationId);
    }
}