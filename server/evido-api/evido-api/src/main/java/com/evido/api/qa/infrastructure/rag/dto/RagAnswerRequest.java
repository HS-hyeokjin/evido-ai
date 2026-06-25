package com.evido.api.qa.infrastructure.rag.dto;

import com.evido.api.qa.application.dto.ConversationContext;
import com.evido.api.qa.application.port.in.command.AskCommand;
import com.evido.api.usersetting.domain.AnswerStyle;
import com.evido.api.usersetting.domain.EvidenceMode;

import java.util.List;

public record RagAnswerRequest(
        Long workspaceId,
        Long conversationId,
        String queryText,
        Integer topK,
        String conversationSummary,
        List<RecentMessage> recentMessages,
        AnswerStyle answerStyle,
        EvidenceMode evidenceMode,
        String answerStyleInstruction
) {
    public record RecentMessage(
            String role,
            String content
    ) {}

    public static RagAnswerRequest from(AskCommand c, ConversationContext context) {
        ConversationContext safeContext =
                context == null ? ConversationContext.empty() : context;

        List<RecentMessage> recentMessages = safeContext.recentMessages()
                .stream()
                .map(m -> new RecentMessage(m.role(), m.content()))
                .toList();

        return new RagAnswerRequest(
                c.workspaceId(),
                c.conversationId(),
                c.queryText(),
                c.topK(),
                safeContext.summary(),
                recentMessages,
                c.answerStyle(),
                c.evidenceMode(),
                buildAnswerStyleInstruction(c.answerStyle(), c.evidenceMode())
        );
    }

    private static String buildAnswerStyleInstruction(
            AnswerStyle answerStyle,
            EvidenceMode evidenceMode
    ) {
        String styleInstruction = switch (answerStyle) {
            case SIMPLE -> "핵심만 짧고 명확하게 답변하세요. 불필요한 배경 설명은 줄이세요.";
            case DETAILED -> "배경, 이유, 흐름을 포함해서 자세히 설명하세요. 사용자가 이해하기 쉽게 단계적으로 답변하세요.";
            case BUSINESS -> "실무 적용 관점에서 답변하세요. 실제 업무에서 확인할 점, 주의사항, 활용 방법을 중심으로 정리하세요.";
            case EVIDENCE -> "문서 근거를 우선으로 답변하세요. 추측은 피하고, 근거가 부족한 내용은 부족하다고 말하세요.";
        };

        String evidenceInstruction = switch (evidenceMode) {
            case SIMPLE -> "근거는 사용자가 이해하기 쉽게 핵심 문장 위주로 간단히 표시하세요.";
            case DETAILED -> "근거는 문서명, 문서 조각, 관련도, 판단 이유를 가능한 자세히 표시하세요.";
        };

        return styleInstruction + "\n" + evidenceInstruction;
    }
}