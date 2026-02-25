package com.evido.api.document.application.dto;

import org.springframework.data.domain.Sort;

public record ListDocumentsQuery(
        Long workspaceId,
        Long userId,
        String q,
        int page,
        int size,
        Sort sort
) {}
