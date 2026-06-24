export type AnswerStyle = "EVIDENCE" | "SIMPLE" | "DETAILED" | "BUSINESS";

export type EvidenceMode = "SIMPLE" | "DETAILED";

export type ThemeMode = "SYSTEM" | "LIGHT" | "DARK";

export type UserSettings = {
    displayName: string;
    email: string;
    answerStyle: AnswerStyle;
    evidenceMode: EvidenceMode;
    theme: ThemeMode;
};

export type SettingOption<T extends string> = {
    value: T;
    label: string;
    description: string;
    badge?: string;
    example?: string;
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
    displayName: "사용자",
    email: "user@email.com",
    answerStyle: "EVIDENCE",
    evidenceMode: "SIMPLE",
    theme: "SYSTEM",
};

export const answerStyleOptions: SettingOption<AnswerStyle>[] = [
    {
        value: "EVIDENCE",
        label: "근거 중심",
        badge: "추천",
        description: "문서 근거를 우선으로 보여주고 신뢰성 있게 답변합니다.",
        example: "답변과 함께 관련 문서 조각을 확인하고 싶을 때 적합합니다.",
    },
    {
        value: "SIMPLE",
        label: "간단히 요약",
        description: "핵심 내용만 짧고 빠르게 답변합니다.",
        example: "긴 문서를 빠르게 파악하고 싶을 때 적합합니다.",
    },
    {
        value: "DETAILED",
        label: "자세히 설명",
        description: "배경과 이유까지 포함해서 자세히 설명합니다.",
        example: "개념을 이해하거나 학습용으로 사용할 때 적합합니다.",
    },
    {
        value: "BUSINESS",
        label: "실무 중심",
        description: "실제 업무 적용 방법과 주의사항 중심으로 답변합니다.",
        example: "보고서, 업무 판단, 실무 적용 포인트를 알고 싶을 때 적합합니다.",
    },
];

export const evidenceModeOptions: SettingOption<EvidenceMode>[] = [
    {
        value: "SIMPLE",
        label: "간단히 보기",
        badge: "기본",
        description: "근거 문서의 핵심 문장만 간단히 표시합니다.",
        example: "일반 사용자가 보기 편한 방식입니다.",
    },
    {
        value: "DETAILED",
        label: "자세히 보기",
        description: "문서 ID, 조각 ID, 유사도 등 상세 정보를 함께 표시합니다.",
        example: "개발자, 관리자, 검증용으로 확인할 때 적합합니다.",
    },
];

export const themeModeLabels: Record<ThemeMode, string> = {
    SYSTEM: "시스템 설정",
    LIGHT: "라이트 모드",
    DARK: "다크 모드",
};

export function getAnswerStyleLabel(answerStyle: AnswerStyle) {
    return answerStyleOptions.find((option) => option.value === answerStyle)?.label ?? answerStyle;
}

export function getEvidenceModeLabel(evidenceMode: EvidenceMode) {
    return evidenceModeOptions.find((option) => option.value === evidenceMode)?.label ?? evidenceMode;
}

export function getThemeModeLabel(theme: ThemeMode) {
    return themeModeLabels[theme];
}