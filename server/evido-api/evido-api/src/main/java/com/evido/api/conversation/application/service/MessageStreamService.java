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
import com.evido.api.conversation.application.port.in.command.SendFirstMessageCommand;

@Service
@RequiredArgsConstructor
public class MessageStreamService {

    private static final int RECENT_MESSAGE_LIMIT = 6;
    private static final int DEFAULT_TOP_K = 5;
    private static final String INTERRUPTED_SUFFIX = "\n\n[응답 생성이 중단되었습니다.]";

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

    public SseEmitter streamFirstMessage(SendFirstMessageCommand command) {
        SseEmitter emitter = new SseEmitter(0L);

        messageStreamTaskExecutor.execute(() -> runFirstMessageStream(command, emitter));

        return emitter;
    }

    private void runStream(
            SendMessageCommand command,
            SseEmitter emitter
    ) {
        StringBuilder answerBuffer = new StringBuilder();
        AtomicBoolean failed = new AtomicBoolean(false);
        AtomicBoolean connectionClosed = new AtomicBoolean(false);
        boolean assistantSaved = false;

        registerEmitterCallbacks(emitter, connectionClosed);

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
                    DEFAULT_TOP_K,
                    command.effectiveAnswerStyle(),
                    command.effectiveEvidenceMode()
            );

            ragPort.answerStream(askCommand, context)
                    .doOnNext(event -> {
                        if (connectionClosed.get()) {
                            throw new ClientDisconnectedException();
                        }

                        handleRagEvent(
                                event,
                                emitter,
                                answerBuffer,
                                failed
                        );
                    })
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

            assistantSaved = true;

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
            if (!assistantSaved && isClientDisconnectedOrClosed(e, connectionClosed)) {
                Message partialMessage = savePartialAssistantMessageIfPossible(
                        command.conversationId(),
                        answerBuffer
                );

                if (partialMessage != null) {
                    updateSummaryIfNeeded(command.conversationId());
                }

                emitter.complete();
                return;
            }

            sendErrorSafely(
                    emitter,
                    "MESSAGE_STREAM_ERROR",
                    "메시지 스트리밍 처리 중 오류가 발생했습니다. " + e.getMessage()
            );

            emitter.completeWithError(e);
        }
    }

    private void runFirstMessageStream(
            SendFirstMessageCommand command,
            SseEmitter emitter
    ) {
        StringBuilder answerBuffer = new StringBuilder();
        AtomicBoolean failed = new AtomicBoolean(false);
        AtomicBoolean connectionClosed = new AtomicBoolean(false);
        boolean assistantSaved = false;
        Long conversationIdForPartialSave = null;

        registerEmitterCallbacks(emitter, connectionClosed);

        try {
            validateAccess(command.workspaceId(), command.userId());

            String title = generateTitle(command.content());

            Conversation conversation = conversationRepositoryPort.save(
                    Conversation.create(command.workspaceId(), title)
            );

            conversationIdForPartialSave = conversation.getId();

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

            AskCommand askCommand = new AskCommand(
                    conversation.getWorkspaceId(),
                    conversation.getId(),
                    command.content(),
                    DEFAULT_TOP_K,
                    command.effectiveAnswerStyle(),
                    command.effectiveEvidenceMode()
            );

            ragPort.answerStream(askCommand, ConversationContext.empty())
                    .doOnNext(event -> {
                        if (connectionClosed.get()) {
                            throw new ClientDisconnectedException();
                        }

                        handleRagEvent(
                                event,
                                emitter,
                                answerBuffer,
                                failed
                        );
                    })
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

            assistantSaved = true;

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
            if (!assistantSaved && isClientDisconnectedOrClosed(e, connectionClosed)) {
                Message partialMessage = savePartialAssistantMessageIfPossible(
                        conversationIdForPartialSave,
                        answerBuffer
                );

                if (partialMessage != null && conversationIdForPartialSave != null) {
                    updateSummaryIfNeeded(conversationIdForPartialSave);
                }

                emitter.complete();
                return;
            }

            sendErrorSafely(
                    emitter,
                    "FIRST_MESSAGE_STREAM_ERROR",
                    "첫 메시지 스트리밍 처리 중 오류가 발생했습니다. " + e.getMessage()
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

    private void registerEmitterCallbacks(
            SseEmitter emitter,
            AtomicBoolean connectionClosed
    ) {
        emitter.onCompletion(() -> connectionClosed.set(true));
        emitter.onTimeout(() -> connectionClosed.set(true));
        emitter.onError(error -> connectionClosed.set(true));
    }

    private Message savePartialAssistantMessageIfPossible(
            Long conversationId,
            StringBuilder answerBuffer
    ) {
        if (conversationId == null) {
            return null;
        }

        String content = answerBuffer.toString().trim();

        if (content.isBlank()) {
            return null;
        }

        String interruptedContent = content.endsWith("[응답 생성이 중단되었습니다.]")
                ? content
                : content + INTERRUPTED_SUFFIX;

        return saveAssistantMessage(conversationId, interruptedContent);
    }

    private boolean isClientDisconnectedOrClosed(
            Exception e,
            AtomicBoolean connectionClosed
    ) {
        if (connectionClosed.get()) {
            return true;
        }

        return isClientDisconnected(e);
    }

    private boolean isClientDisconnected(Throwable throwable) {
        Throwable current = throwable;

        while (current != null) {
            if (current instanceof ClientDisconnectedException) {
                return true;
            }

            String message = current.getMessage();

            if (message != null) {
                String lower = message.toLowerCase();

                if (
                        lower.contains("broken pipe") ||
                                lower.contains("connection reset") ||
                                lower.contains("clientabortexception") ||
                                lower.contains("sse client disconnected")
                ) {
                    return true;
                }
            }

            current = current.getCause();
        }

        return false;
    }

    private static class ClientDisconnectedException extends RuntimeException {
        public ClientDisconnectedException() {
            super("SSE client disconnected");
        }
    }
}