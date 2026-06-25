import { deleteData, getData, patchData, postData } from "./http";
import { ApiError } from "./ApiError";
import type {
    ConversationResponse,
    MessageResponse,
    SendMessageResponse,
} from "../types/Conversation";
import type { ChatStreamEvent } from "../types/ChatStream";
import type { CommonResponse } from "../types/ApiResponse";
import type {
    AnswerStyle,
    EvidenceMode,
} from "../types/userSettings";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export function listConversations(
    workspaceId: number | string
): Promise<ConversationResponse[]> {
    return getData<ConversationResponse[]>(
        `/api/conversations/${workspaceId}/conversations`
    );
}

export function createConversation(
    workspaceId: number | string
): Promise<ConversationResponse> {
    return postData<ConversationResponse>(
        `/api/conversations/${workspaceId}/conversations`
    );
}

export function renameConversation(
    conversationId: number | string,
    title: string
): Promise<ConversationResponse> {
    return patchData<ConversationResponse, { title: string }>(
        `/api/conversations/${conversationId}`,
        { title }
    );
}

export function removeConversation(
    conversationId: number | string
): Promise<void> {
    return deleteData(`/api/conversations/${conversationId}`);
}

export function getConversationMessages(
    conversationId: number | string
): Promise<MessageResponse[]> {
    return getData<MessageResponse[]>(
        `/api/conversations/${conversationId}/messages`
    );
}

export type MessageSettingPayload = {
    answerStyle?: AnswerStyle;
    evidenceMode?: EvidenceMode;
};

export function sendFirstMessage(
    workspaceId: number | string,
    content: string,
    settings?: MessageSettingPayload,
): Promise<SendMessageResponse> {
    return postData<SendMessageResponse, { content: string } & MessageSettingPayload>(
        `/api/conversations/workspaces/${workspaceId}/first-message`,
        {
            content,
            answerStyle: settings?.answerStyle,
            evidenceMode: settings?.evidenceMode,
        }
    );
}

export function sendConversationMessage(
    conversationId: number | string,
    content: string,
    settings?: MessageSettingPayload,
): Promise<SendMessageResponse> {
    return postData<SendMessageResponse, { content: string } & MessageSettingPayload>(
        `/api/conversations/${conversationId}/messages`,
        {
            content,
            answerStyle: settings?.answerStyle,
            evidenceMode: settings?.evidenceMode,
        }
    );
}

export type SendConversationMessageStreamOptions = {
    signal?: AbortSignal;
    onEvent: (event: ChatStreamEvent) => void;
    answerStyle?: AnswerStyle;
    evidenceMode?: EvidenceMode;
};

export async function sendConversationMessageStream(
    conversationId: number | string,
    content: string,
    options: SendConversationMessageStreamOptions
): Promise<void> {
    await postSseStream(
        `/api/conversations/${conversationId}/messages/stream`,
        {
            content,
            answerStyle: options.answerStyle,
            evidenceMode: options.evidenceMode,
        },
        options
    );
}

export async function sendFirstMessageStream(
    workspaceId: number | string,
    content: string,
    options: SendConversationMessageStreamOptions
): Promise<void> {
    await postSseStream(
        `/api/conversations/workspaces/${workspaceId}/first-message/stream`,
        {
            content,
            answerStyle: options.answerStyle,
            evidenceMode: options.evidenceMode,
        },
        options
    );
}

async function postSseStream<TBody>(
    path: string,
    body: TBody,
    options: SendConversationMessageStreamOptions,
    retried = false
): Promise<void> {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
        },
        credentials: "include",
        body: JSON.stringify(body),
        signal: options.signal,
    });

    if (response.status === 401 && !retried) {
        try {
            await refreshAccessTokenForFetch();

            return postSseStream(path, body, options, true);
        } catch {
            window.location.href = "/login";

            throw new ApiError(
                401,
                "UNAUTHORIZED",
                "로그인이 만료되었습니다. 다시 로그인해주세요."
            );
        }
    }

    if (!response.ok) {
        throw await toApiErrorFromFetchResponse(response);
    }

    if (!response.body) {
        throw new ApiError(
            0,
            "EMPTY_STREAM_BODY",
            "스트리밍 응답을 받을 수 없습니다."
        );
    }

    await readSseStream(response.body, options.onEvent);
}

async function readSseStream(
    body: ReadableStream<Uint8Array>,
    onEvent: (event: ChatStreamEvent) => void
): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";

    try {
        while (true) {
            const { value, done } = await reader.read();

            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });

            const rawEvents = buffer.split("\n\n");
            buffer = rawEvents.pop() ?? "";

            for (const rawEvent of rawEvents) {
                const event = parseSseEvent(rawEvent);

                if (event) {
                    onEvent(event);
                }
            }
        }

        if (buffer.trim()) {
            const event = parseSseEvent(buffer);

            if (event) {
                onEvent(event);
            }
        }
    } finally {
        reader.releaseLock();
    }
}

function parseSseEvent(rawEvent: string): ChatStreamEvent | null {
    const dataLines = rawEvent
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice("data:".length).trimStart());

    if (dataLines.length === 0) {
        return null;
    }

    const data = dataLines.join("\n");

    if (!data || data === "[DONE]") {
        return null;
    }

    try {
        return JSON.parse(data) as ChatStreamEvent;
    } catch (error) {
        console.error("SSE 이벤트 파싱 실패:", data, error);

        return {
            type: "error",
            code: "SSE_PARSE_ERROR",
            message: "스트리밍 응답을 해석하지 못했습니다.",
        };
    }
}

async function refreshAccessTokenForFetch(): Promise<void> {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    });

    if (!response.ok) {
        throw await toApiErrorFromFetchResponse(response);
    }
}

async function toApiErrorFromFetchResponse(response: Response): Promise<ApiError> {
    const status = response.status;

    try {
        const body = (await response.json()) as CommonResponse<null>;

        return new ApiError(
            status,
            body?.code ?? `HTTP_${status}`,
            body?.message ?? getDefaultMessageByStatus(status)
        );
    } catch {
        return new ApiError(
            status,
            `HTTP_${status}`,
            getDefaultMessageByStatus(status)
        );
    }
}

function getDefaultMessageByStatus(status: number): string {
    switch (status) {
        case 400:
            return "잘못된 요청입니다.";
        case 401:
            return "로그인이 필요합니다.";
        case 403:
            return "접근 권한이 없습니다.";
        case 404:
            return "요청한 데이터를 찾을 수 없습니다.";
        case 413:
            return "업로드 가능한 최대 용량을 초과했습니다.";
        case 500:
            return "서버 오류가 발생했습니다.";
        case 502:
            return "외부 서버 호출 중 오류가 발생했습니다.";
        default:
            return "요청 처리 중 오류가 발생했습니다.";
    }
}