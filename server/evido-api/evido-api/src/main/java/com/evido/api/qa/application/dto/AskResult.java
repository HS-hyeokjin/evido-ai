package com.evido.api.qa.application.dto;

import com.evido.api.qa.infrastructure.rag.dto.RagAnswerResponse;

import java.util.List;

public record AskResult(
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

    public static AskResult from(RagAnswerResponse resp) {
        List<Evidence> evs = resp.evidences() == null ? List.of() :
                resp.evidences().stream()
                        .map(e -> new Evidence(e.chunkId(), e.score(), e.chunkIndex(), e.contentHead()))
                        .toList();

        return new AskResult(resp.queryText(), resp.answer(), evs);
    }
}
