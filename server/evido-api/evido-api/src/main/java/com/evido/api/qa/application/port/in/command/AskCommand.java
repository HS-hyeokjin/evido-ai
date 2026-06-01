package com.evido.api.qa.application.port.in.command;

import com.evido.api.qa.api.dto.request.AskRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AskCommand(
        @NotNull Long workspaceId,
        @NotNull Long conversationId,
        @NotBlank String queryText,
        Integer topK
) {
    public static AskCommand from(AskRequest req) {
        return new AskCommand(
                req.workspaceId(),
                req.conversationId(),
                req.queryText(),
                req.topK()
        );
    }
}