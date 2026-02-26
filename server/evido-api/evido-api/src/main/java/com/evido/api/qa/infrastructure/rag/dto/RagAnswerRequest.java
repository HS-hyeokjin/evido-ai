package com.evido.api.qa.infrastructure.rag.dto;

import com.evido.api.qa.application.dto.AskCommand;

public record RagAnswerRequest(
        Long workspaceId,
        String queryText,
        Integer topK
) {
    public static RagAnswerRequest from(AskCommand c) {
        return new RagAnswerRequest(c.workspaceId(), c.queryText(),  c.topK());
    }
}
