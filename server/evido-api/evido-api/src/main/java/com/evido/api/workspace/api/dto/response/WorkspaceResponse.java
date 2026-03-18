package com.evido.api.workspace.api.dto.response;

import java.time.LocalDateTime;

public record WorkspaceResponse(
        Long id,
        String name,
        LocalDateTime createdAt
) {}