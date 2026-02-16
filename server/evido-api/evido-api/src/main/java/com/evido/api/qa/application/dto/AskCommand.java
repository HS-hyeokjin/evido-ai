package com.evido.api.qa.application.dto;

import com.evido.api.qa.api.dto.AskRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AskCommand(
        @NotBlank String queryText,
        @NotNull Long documentId,
        @NotNull Long versionId,
        Integer topK
) {
    public static AskCommand from(AskRequest req) {
        return new AskCommand(req.queryText(), req.documentId(), req.versionId(), req.topK());
    }
}
