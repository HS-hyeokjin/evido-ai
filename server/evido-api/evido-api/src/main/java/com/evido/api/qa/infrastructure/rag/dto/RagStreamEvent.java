package com.evido.api.qa.infrastructure.rag.dto;

import java.util.List;

public record RagStreamEvent(
        String type,
        String content,
        String message,
        String code,
        List<Evidence> evidences
) {
    public record Evidence(
            Long chunkId,
            Double score,
            Integer chunkIndex,
            String contentHead,
            Long documentId,
            Long versionId
    ) {
    }

    public boolean isToken() {
        return "token".equals(type);
    }

    public boolean isStatus() {
        return "status".equals(type);
    }

    public boolean isEvidence() {
        return "evidence".equals(type);
    }

    public boolean isDone() {
        return "done".equals(type);
    }

    public boolean isError() {
        return "error".equals(type);
    }
}