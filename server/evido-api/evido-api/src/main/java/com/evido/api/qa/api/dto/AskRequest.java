package com.evido.api.qa.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AskRequest(
        @NotNull Long documentId,
        @NotNull Long versionId,
        @NotBlank String queryText,
        Integer topK
) {}
