package com.evido.api.qa.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AskRequest(
        @NotNull Long workspaceId,
        @NotNull Long conversationId,
        @NotBlank String queryText,
        Integer topK
) {
}