package com.evido.api.qa.api.dto.response;

import java.util.List;

public record AskResponse(
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
