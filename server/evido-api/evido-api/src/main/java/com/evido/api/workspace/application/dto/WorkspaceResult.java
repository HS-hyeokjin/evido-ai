package com.evido.api.workspace.application.dto;

import java.time.LocalDateTime;

public record WorkspaceResult(
        Long id,
        String name,
        LocalDateTime createdAt
) {}