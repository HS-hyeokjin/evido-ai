package com.evido.api.qa.infrastructure.rag.dto;

import com.evido.api.qa.application.dto.ConversationContext;
import com.evido.api.qa.application.port.in.command.AskCommand;

import java.util.List;

public record RagAnswerRequest(
        Long workspaceId,
        Long conversationId,
        String queryText,
        Integer topK,
        String conversationSummary,
        List<RecentMessage> recentMessages
) {
    public record RecentMessage(
            String role,
            String content
    ) {}

    public static RagAnswerRequest from(AskCommand c, ConversationContext context) {
        ConversationContext safeContext =
                context == null ? ConversationContext.empty() : context;

        List<RecentMessage> recentMessages = safeContext.recentMessages()
                .stream()
                .map(m -> new RecentMessage(m.role(), m.content()))
                .toList();

        return new RagAnswerRequest(
                c.workspaceId(),
                c.conversationId(),
                c.queryText(),
                c.topK(),
                safeContext.summary(),
                recentMessages
        );
    }
}