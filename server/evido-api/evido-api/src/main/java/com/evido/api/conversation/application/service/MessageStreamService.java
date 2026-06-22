package com.evido.api.conversation.application.service;

import com.evido.api.common.exception.BusinessException;
import com.evido.api.common.exception.ErrorCode;
import com.evido.api.conversation.api.dto.response.MessageStreamEvent;
import com.evido.api.conversation.application.port.in.command.SendMessageCommand;
import com.evido.api.conversation.application.port.out.ConversationRepositoryPort;
import com.evido.api.conversation.application.port.out.MessageRepositoryPort;
import com.evido.api.conversation.application.port.out.WorkspaceAccessPort;
import com.evido.api.conversation.domain.Conversation;
import com.evido.api.conversation.domain.Message;
import com.evido.api.qa.application.dto.ConversationContext;
import com.evido.api.qa.application.port.in.command.AskCommand;
import com.evido.api.qa.application.port.out.RagPort;
import com.evido.api.qa.infrastructure.rag.dto.RagStreamEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
public class MessageStreamService {

    private static final int RECENT_MESSAGE_LIMIT = 6;
    private static final int DEFAULT_TOP_K = 5;

    private final MessageRepositoryPort messageRepositoryPort;
    private final ConversationRepositoryPort conversationRepositoryPort;
    private final WorkspaceAccessPort workspaceAccessPort;
    private final ConversationSummaryService conversationSummaryService;
    private final RagPort ragPort;

    @Qualifier("messageStreamTaskExecutor")
    private final TaskExecutor messageStreamTaskExecutor;

    public SseEmitter streamMessage(SendMessageCommand command) {
        SseEmitter emitter = new SseEmitter(0L);

        messageStreamTaskExecutor.execute(() -> runStream(command, emitter));

        return emitter;
    }

    private void runStream(
            SendMessageCommand command,
            SseEmitter emitter
    ) {
        StringBuilder answerBuffer = new StringBuilder();
        AtomicBoolean failed = new AtomicBoolean(false);

        try {
            Conversation conversation = getConversation(command.conversationId());
            validateAccess(conversation.getWorkspaceId(), command.userId());

            Message userMessage = saveUserMessage(
                    conversation.getId(),
                    command.content()
            );

            send(
                    emitter,
                    MessageStreamEvent.userMessage(
                            conversation.getId(),
                            userMessage.getId(),
                            userMessage.getContent(),
                            userMessage.getCreatedAt()
                    )
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

            ragPort.answerStream(askCommand, context)
                    .doOnNext(event -> handleRagEvent(
                            event,
                            emitter,
                            answerBuffer,
                            failed
                    ))
                    .blockLast();

            if (failed.get() && answerBuffer.isEmpty()) {
                emitter.complete();
                return;
            }

            if (answerBuffer.isEmpty()) {
                send(
                        emitter,
                        MessageStreamEvent.error(
                                "EMPTY_ASSISTANT_ANSWER",
                                "답변 내용이 비어 있습니다."
                        )
                );
                emitter.complete();
                return;
            }

            Message assistantMessage = saveAssistantMessage(
                    conversation.getId(),
                    answerBuffer.toString()
            );

            updateSummaryIfNeeded(conversation.getId());

            send(
                    emitter,
                    MessageStreamEvent.done(
                            conversation.getId(),
                            assistantMessage.getId(),
                            assistantMessage.getCreatedAt()
                    )
            );

            emitter.complete();

        } catch (Exception e) {
            sendErrorSafely(
                    emitter,
                    "MESSAGE_STREAM_ERROR",
                    "메시지 스트리밍 처리 중 오류가 발생했습니다. " + e.getMessage()
            );

            emitter.completeWithError(e);
        }
    }

    private void handleRagEvent(
            RagStreamEvent event,
            SseEmitter emitter,
            StringBuilder answerBuffer,
            AtomicBoolean failed
    ) {
        if (event == null || event.type() == null) {
            return;
        }

        if (event.isStatus()) {
            send(
                    emitter,
                    MessageStreamEvent.status(event.message())
            );
            return;
        }

        if (event.isEvidence()) {
            send(
                    emitter,
                    MessageStreamEvent.evidence(
                            toMessageEvidences(event.evidences())
                    )
            );
            return;
        }

        if (event.isToken()) {
            String token = event.content();

            if (token == null || token.isEmpty()) {
                return;
            }

            answerBuffer.append(token);

            send(
                    emitter,
                    MessageStreamEvent.token(token)
            );
            return;
        }

        if (event.isError()) {
            failed.set(true);

            send(
                    emitter,
                    MessageStreamEvent.error(
                            event.code() == null ? "RAG_STREAM_ERROR" : event.code(),
                            event.message() == null ? "RAG 서버 오류가 발생했습니다." : event.message()
                    )
            );
        }

    }

    private ConversationContext buildConversationContext(
            Long conversationId,
            Long currentMessageId
    ) {
        String summary = conversationSummaryService.getSummary(conversationId);

        List<ConversationContext.RecentMessage> recentMessages =
                messageRepositoryPort.findByConversationId(conversationId)
                        .stream()
                        .filter(message -> !message.getId().equals(currentMessageId))
                        .sorted(Comparator.comparing(Message::getCreatedAt).reversed())
                        .limit(RECENT_MESSAGE_LIMIT)
                        .sorted(Comparator.comparing(Message::getCreatedAt))
                        .map(message -> new ConversationContext.RecentMessage(
                                message.getRole().name().toLowerCase(),
                                message.getContent()
                        ))
                        .toList();

        return new ConversationContext(summary, recentMessages);
    }

    private List<MessageStreamEvent.Evidence> toMessageEvidences(
            List<RagStreamEvent.Evidence> evidences
    ) {
        if (evidences == null) {
            return List.of();
        }

        return evidences.stream()
                .map(evidence -> new MessageStreamEvent.Evidence(
                        evidence.chunkId(),
                        evidence.score(),
                        evidence.chunkIndex(),
                        evidence.contentHead(),
                        evidence.documentId(),
                        evidence.versionId()
                ))
                .toList();
    }

    private Conversation getConversation(Long conversationId) {
        return conversationRepositoryPort.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("conversation 이 없습니다."));
    }

    private void validateAccess(Long workspaceId, String userId) {
        if (!workspaceAccessPort.hasAccess(workspaceId, userId)) {
            throw new BusinessException(ErrorCode.WORKSPACE_ACCESS_DENIED);
        }
    }

    private Message saveUserMessage(
            Long conversationId,
            String content
    ) {
        return messageRepositoryPort.save(
                Message.createUser(conversationId, content)
        );
    }

    private Message saveAssistantMessage(
            Long conversationId,
            String content
    ) {
        return messageRepositoryPort.save(
                Message.createAssistant(conversationId, content)
        );
    }

    private void updateSummaryIfNeeded(Long conversationId) {
        conversationSummaryService.updateIfNeeded(conversationId)
                .onErrorResume(e -> {
                    System.out.println("[SUMMARY UPDATE ERROR] " + e.getMessage());
                    return reactor.core.publisher.Mono.empty();
                })
                .block();
    }

    private void send(
            SseEmitter emitter,
            MessageStreamEvent event
    ) {
        try {
            emitter.send(
                    SseEmitter.event()
                            .name(event.type())
                            .data(event)
            );
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void sendErrorSafely(
            SseEmitter emitter,
            String code,
            String message
    ) {
        try {
            emitter.send(
                    SseEmitter.event()
                            .name("error")
                            .data(MessageStreamEvent.error(code, message))
            );
        } catch (Exception ignored) {
        }
    }
}