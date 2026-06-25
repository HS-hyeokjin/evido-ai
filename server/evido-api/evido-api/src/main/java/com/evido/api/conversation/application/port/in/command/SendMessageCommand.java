package com.evido.api.conversation.application.port.in.command;

import com.evido.api.usersetting.domain.AnswerStyle;
import com.evido.api.usersetting.domain.EvidenceMode;

public record SendMessageCommand(
        Long conversationId,
        String userId,
        String content,
        AnswerStyle answerStyle,
        EvidenceMode evidenceMode
) {

    public AnswerStyle effectiveAnswerStyle() {
        return answerStyle == null ? AnswerStyle.EVIDENCE : answerStyle;
    }

    public EvidenceMode effectiveEvidenceMode() {
        return evidenceMode == null ? EvidenceMode.SIMPLE : evidenceMode;
    }
}