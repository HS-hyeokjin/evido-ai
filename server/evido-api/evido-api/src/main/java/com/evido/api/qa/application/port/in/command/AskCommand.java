package com.evido.api.qa.application.port.in.command;

import com.evido.api.qa.api.dto.request.AskRequest;
import jakarta.validation.constraints.NotBlank;

public record AskCommand(
        @NotBlank Long workspaceId,
        @NotBlank String queryText,
        Integer topK
) {
    public static AskCommand from(AskRequest req) {
        return new AskCommand(req.workspaceId(), req.queryText(), req.topK());
    }
}
