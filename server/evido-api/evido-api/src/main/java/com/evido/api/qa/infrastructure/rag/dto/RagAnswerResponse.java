package com.evido.api.qa.infrastructure.rag.dto;

import java.util.List;

public record RagAnswerResponse(
        String queryText,
        String answer,
        List<Evidence> evidences
) {
    public record Evidence(
            Long chunkId,
            Double score,
            Integer chunkIndex,
            String contentHead
    ) {}
}
