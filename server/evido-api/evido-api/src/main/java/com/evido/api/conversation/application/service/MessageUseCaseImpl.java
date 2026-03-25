package com.evido.api.conversation.application.service;

import com.evido.api.conversation.api.dto.MessageRequest;
import com.evido.api.conversation.api.dto.MessageResponse;
import com.evido.api.conversation.api.dto.SendMessageResponse;
import com.evido.api.conversation.application.port.in.ConversationUseCase;
import com.evido.api.conversation.application.port.in.MessageUseCase;
import com.evido.api.conversation.application.port.out.ConversationRepositoryPort;
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
public class MessageUseCaseImpl implements MessageUseCase {

    private final MessageService messageService;
    private final QaUseCase qaUseCase;
    private final ConversationRepositoryPort conversationRepository;

    @Override
    public Mono<SendMessageResponse> sendMessage(Long conversationId, MessageRequest request) {

        Message userMessage = messageService.saveUserMessage(
                conversationId,
                request.content()
        );

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("conversation 없음"));

        Long workspaceId = conversation.getWorkspaceId();

        return qaUseCase.answer(
                new AskCommand(workspaceId, request.content(), 5)
        ).map(result -> {

            Message assistantMessage = messageService.saveAssistantMessage(
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

        return messageService.getMessages(conversationId)
                .stream()
                .map(this::toResponse)
                .toList();
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