package com.evido.api.conversation.application.service;

import com.evido.api.conversation.application.port.out.ConversationSummaryGeneratorPort;
import com.evido.api.conversation.application.port.out.ConversationSummaryRepositoryPort;
import com.evido.api.conversation.application.port.out.MessageRepositoryPort;
import com.evido.api.conversation.application.dto.ConversationSummaryMessage;
import com.evido.api.conversation.domain.ConversationSummary;
import com.evido.api.conversation.domain.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationSummaryService {

    private static final int RECENT_MESSAGE_KEEP_COUNT = 6;
    private static final int MIN_MESSAGES_TO_SUMMARIZE = 10;

    private final ConversationSummaryRepositoryPort conversationSummaryRepositoryPort;
    private final MessageRepositoryPort messageRepositoryPort;
    private final ConversationSummaryGeneratorPort conversationSummaryGeneratorPort;

    public Mono<Void> updateIfNeeded(Long conversationId) {
        List<Message> messages = messageRepositoryPort.findByConversationId(conversationId)
                .stream()
                .sorted(Comparator.comparing(Message::getCreatedAt))
                .toList();

        if (messages.size() <= RECENT_MESSAGE_KEEP_COUNT) {
            return Mono.empty();
        }

        ConversationSummary existingSummary = conversationSummaryRepositoryPort
                .findByConversationId(conversationId)
                .orElse(null);

        Long lastSummarizedMessageId = existingSummary == null
                ? null
                : existingSummary.getLastMessageId();

        List<Message> summarizableMessages = findSummarizableMessages(
                messages,
                lastSummarizedMessageId
        );

        if (summarizableMessages.size() < MIN_MESSAGES_TO_SUMMARIZE) {
            return Mono.empty();
        }

        Long newLastMessageId = summarizableMessages
                .get(summarizableMessages.size() - 1)
                .getId();

        List<ConversationSummaryMessage> summaryMessages = summarizableMessages
                .stream()
                .map(message -> new ConversationSummaryMessage(
                        message.getRole().name().toLowerCase(),
                        message.getContent()
                ))
                .toList();

        String oldSummary = existingSummary == null
                ? null
                : existingSummary.getSummary();

        return conversationSummaryGeneratorPort.generateSummary(oldSummary, summaryMessages)
                .doOnNext(newSummary -> saveSummary(
                        conversationId,
                        existingSummary,
                        newSummary,
                        newLastMessageId
                ))
                .then();
    }

    public String getSummary(Long conversationId) {
        return conversationSummaryRepositoryPort.findByConversationId(conversationId)
                .map(ConversationSummary::getSummary)
                .orElse(null);
    }

    private List<Message> findSummarizableMessages(
            List<Message> allMessages,
            Long lastSummarizedMessageId
    ) {
        List<Message> oldMessagesExceptRecent = allMessages
                .stream()
                .limit(Math.max(0, allMessages.size() - RECENT_MESSAGE_KEEP_COUNT))
                .toList();

        if (lastSummarizedMessageId == null) {
            return oldMessagesExceptRecent;
        }

        return oldMessagesExceptRecent
                .stream()
                .filter(message -> message.getId() > lastSummarizedMessageId)
                .toList();
    }

    private void saveSummary(
            Long conversationId,
            ConversationSummary existingSummary,
            String newSummary,
            Long newLastMessageId
    ) {
        if (newSummary == null || newSummary.isBlank()) {
            return;
        }

        ConversationSummary summaryToSave = existingSummary == null
                ? ConversationSummary.create(
                conversationId,
                newSummary,
                newLastMessageId
        )
                : existingSummary.update(
                newSummary,
                newLastMessageId
        );

        conversationSummaryRepositoryPort.save(summaryToSave);
    }
}