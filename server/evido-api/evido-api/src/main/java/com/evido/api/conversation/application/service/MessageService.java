package com.evido.api.conversation.application.service;

import com.evido.api.conversation.api.dto.request.MessageRequest;
import com.evido.api.conversation.api.dto.response.MessageResponse;
import com.evido.api.conversation.api.dto.response.SendMessageResponse;
import com.evido.api.conversation.application.port.in.MessageUseCase;
import com.evido.api.conversation.application.port.out.ConversationRepositoryPort;
import com.evido.api.conversation.application.port.out.MessageRepositoryPort;
import com.evido.api.conversation.domain.Conversation;
import com.evido.api.conversation.domain.Message;
import com.evido.api.qa.application.QaUseCase;
import com.evido.api.qa.application.dto.AskCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService implements MessageUseCase {

    private final MessageRepositoryPort messageRepositoryPort;
    private final ConversationRepositoryPort conversationRepositoryPort;
    private final QaUseCase qaUseCase;

    @Override
    public Mono<SendMessageResponse> sendMessage(Long conversationId, MessageRequest request) {

        Message userMessage = saveUserMessage(conversationId, request.content());

        Conversation conversation = conversationRepositoryPort.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("conversation 없음"));

        Long workspaceId = conversation.getWorkspaceId();

        return qaUseCase.answer(new AskCommand(workspaceId, request.content(), 5))
                .map(result -> {
                    Message assistantMessage = saveAssistantMessage(
                            conversationId,
                            result.answer()
                    );

                    return new SendMessageResponse(
                            List.of(
                                    toResponse(userMessage),
                                    toResponse(assistantMessage)
                            )
                    );
                });
    }

    @Override
    public List<MessageResponse> getMessages(Long conversationId) {
        return messageRepositoryPort.findByConversationId(conversationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Message saveUserMessage(Long conversationId, String content) {
        return messageRepositoryPort.save(
                Message.createUser(conversationId, content)
        );
    }

    private Message saveAssistantMessage(Long conversationId, String content) {
        return messageRepositoryPort.save(
                Message.createAssistant(conversationId, content)
        );
    }

    private MessageResponse toResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getRole().name().toLowerCase(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}