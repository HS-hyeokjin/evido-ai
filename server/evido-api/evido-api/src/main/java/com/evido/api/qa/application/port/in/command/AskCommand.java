package com.evido.api.qa.application.port.in.command;

import com.evido.api.qa.api.dto.request.AskRequest;
import com.evido.api.usersetting.domain.AnswerStyle;
import com.evido.api.usersetting.domain.EvidenceMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AskCommand(
        @NotNull Long workspaceId,
        @NotNull Long conversationId,
        @NotBlank String queryText,
        Integer topK,
        AnswerStyle answerStyle,
        EvidenceMode evidenceMode
) {

    public AskCommand {
        if (answerStyle == null) {
            answerStyle = AnswerStyle.EVIDENCE;
        }

        if (evidenceMode == null) {
            evidenceMode = EvidenceMode.SIMPLE;
        }
    }

    public static AskCommand from(AskRequest req) {
        return new AskCommand(
                req.workspaceId(),
                req.conversationId(),
                req.queryText(),
                req.topK(),
                req.answerStyle(),
                req.evidenceMode()
        );
    }
}