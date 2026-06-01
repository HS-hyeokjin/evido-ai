package com.evido.api.conversation.application.service;

import com.evido.api.conversation.application.dto.MessageResult;
import com.evido.api.conversation.application.dto.SendMessageResult;
import com.evido.api.conversation.application.port.in.MessageUseCase;
import com.evido.api.conversation.application.port.in.command.SendFirstMessageCommand;
import com.evido.api.conversation.application.port.in.command.SendMessageCommand;
import com.evido.api.conversation.application.port.in.query.GetMessagesQuery;
import com.evido.api.conversation.application.port.out.ConversationRepositoryPort;
import com.evido.api.conversation.application.port.out.MessageRepositoryPort;
import com.evido.api.conversation.application.port.out.WorkspaceAccessPort;
import com.evido.api.conversation.domain.Conversation;
import com.evido.api.conversation.domain.Message;
import com.evido.api.qa.application.dto.ConversationContext;
import com.evido.api.qa.application.port.in.QaUseCase;
import com.evido.api.qa.application.port.in.command.AskCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService implements MessageUseCase {

    private static final int RECENT_MESSAGE_LIMIT = 6;
    private static final int DEFAULT_TOP_K = 5;

    private final MessageRepositoryPort messageRepositoryPort;
    private final ConversationRepositoryPort conversationRepositoryPort;
    private final WorkspaceAccessPort workspaceAccessPort;
    private final QaUseCase qaUseCase;
    private final ConversationSummaryService conversationSummaryService;

    @Override
    public Mono<SendMessageResult> sendMessage(SendMessageCommand command) {

        Conversation conversation = getConversation(command.conversationId());
        validateAccess(conversation.getWorkspaceId(), command.userId());

        Message userMessage = saveUserMessage(
                conversation.getId(),
                command.content()
        );

        ConversationContext context = buildConversationContext(
                conversation.getId(),
                userMessage.getId()
        );

        AskCommand askCommand = new AskCommand(
                conversation.getWorkspaceId(),
                conversation.getId(),
                command.content(),
                DEFAULT_TOP_K
        );

        return qaUseCase.answer(askCommand, context)
                .flatMap(result -> {

                    Message assistantMessage = saveAssistantMessage(
                            conversation.getId(),
                            result.answer()
                    );

                    SendMessageResult sendMessageResult = new SendMessageResult(
                            conversation.getId(),
                            List.of(
                                    toResult(userMessage),
                                    toResult(assistantMessage)
                            )
                    );

                    return conversationSummaryService.updateIfNeeded(conversation.getId())
                            .onErrorResume(e -> {
                                System.out.println("[SUMMARY UPDATE ERROR] " + e.getMessage());
                                return Mono.empty();
                            })
                            .thenReturn(sendMessageResult);
                });
    }

    @Override
    public List<MessageResult> getMessages(GetMessagesQuery query) {

        Conversation conversation = getConversation(query.conversationId());
        validateAccess(conversation.getWorkspaceId(), query.userId());

        return messageRepositoryPort.findByConversationId(query.conversationId())
                .stream()
                .map(this::toResult)
                .toList();
    }

    @Override
    public Mono<SendMessageResult> sendFirstMessage(SendFirstMessageCommand command) {

        validateAccess(command.workspaceId(), command.userId());

        String title = generateTitle(command.content());

        Conversation conversation = conversationRepositoryPort.save(
                Conversation.create(command.workspaceId(), title)
        );

        Message userMessage = saveUserMessage(
                conversation.getId(),
                command.content()
        );

        AskCommand askCommand = new AskCommand(
                command.workspaceId(),
                conversation.getId(),
                command.content(),
                DEFAULT_TOP_K
        );

        return qaUseCase.answer(askCommand, ConversationContext.empty())
                .flatMap(result -> {

                    Message assistantMessage = saveAssistantMessage(
                            conversation.getId(),
                            result.answer()
                    );

                    SendMessageResult sendMessageResult = new SendMessageResult(
                            conversation.getId(),
                            List.of(
                                    toResult(userMessage),
                                    toResult(assistantMessage)
                            )
                    );

                    return conversationSummaryService.updateIfNeeded(conversation.getId())
                            .onErrorResume(e -> {
                                System.out.println("[SUMMARY UPDATE ERROR] " + e.getMessage());
                                return Mono.empty();
                            })
                            .thenReturn(sendMessageResult);
                });
    }

    private ConversationContext buildConversationContext(Long conversationId, Long currentMessageId) {
        String summary = conversationSummaryService.getSummary(conversationId);

        List<ConversationContext.RecentMessage> recentMessages =
                messageRepositoryPort.findByConversationId(conversationId)
                        .stream()
                        // 현재 질문은 queryText로 따로 전달하므로 recentMessages에서는 제외
                        .filter(message -> !message.getId().equals(currentMessageId))
                        // 최신순으로 6개만 가져온 뒤
                        .sorted(Comparator.comparing(Message::getCreatedAt).reversed())
                        .limit(RECENT_MESSAGE_LIMIT)
                        // 다시 오래된 순으로 정렬해서 대화 흐름 유지
                        .sorted(Comparator.comparing(Message::getCreatedAt))
                        .map(message -> new ConversationContext.RecentMessage(
                                message.getRole().name().toLowerCase(),
                                message.getContent()
                        ))
                        .toList();

        return new ConversationContext(summary, recentMessages);
    }

    private Conversation getConversation(Long conversationId) {
        return conversationRepositoryPort.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("conversation 이 없습니다."));
    }

    private void validateAccess(Long workspaceId, String userId) {
        if (!workspaceAccessPort.hasAccess(workspaceId, userId)) {
            throw new RuntimeException("워크스페이스 접근 권한이 없습니다.");
        }
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

    private MessageResult toResult(Message message) {
        return new MessageResult(
                message.getId(),
                message.getRole().name().toLowerCase(),
                message.getContent(),
                message.getCreatedAt()
        );
    }

    private String generateTitle(String content) {
        if (content == null || content.isBlank()) {
            return "새 대화";
        }

        String normalized = content.replaceAll("\\s+", " ").trim();

        int maxLength = 20;
        if (normalized.length() <= maxLength) {
            return normalized;
        }

        return normalized.substring(0, maxLength).trim() + "...";
    }
}