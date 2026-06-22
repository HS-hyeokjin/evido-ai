export type ChatStreamEventType =
    | "user_message"
    | "status"
    | "evidence"
    | "token"
    | "done"
    | "error";

export type ChatStreamEvidence = {
    chunkId?: number | null;
    score?: number | null;
    chunkIndex?: number | null;
    contentHead?: string | null;
    documentId?: number | null;
    versionId?: number | null;
};

export type UserMessageStreamEvent = {
    type: "user_message";
    conversationId: number;
    messageId: number;
    role: "user";
    content: string;
    createdAt: string;
};

export type StatusStreamEvent = {
    type: "status";
    message: string;
};

export type EvidenceStreamEvent = {
    type: "evidence";
    evidences: ChatStreamEvidence[];
};

export type TokenStreamEvent = {
    type: "token";
    role?: "assistant";
    content: string;
};

export type DoneStreamEvent = {
    type: "done";
    conversationId: number;
    messageId: number;
    role?: "assistant";
    createdAt: string;
};

export type ErrorStreamEvent = {
    type: "error";
    code?: string;
    message: string;
};

export type ChatStreamEvent =
    | UserMessageStreamEvent
    | StatusStreamEvent
    | EvidenceStreamEvent
    | TokenStreamEvent
    | DoneStreamEvent
    | ErrorStreamEvent;