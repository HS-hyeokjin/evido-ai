import { deleteData, getData, patchData, postData } from "./http";
import type {
    ConversationResponse,
    MessageResponse,
    SendMessageResponse,
} from "../types/Conversation";

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

export function sendFirstMessage(
    workspaceId: number | string,
    content: string
): Promise<SendMessageResponse> {
    return postData<SendMessageResponse, { content: string }>(
        `/api/conversations/workspaces/${workspaceId}/first-message`,
        { content }
    );
}

export function sendConversationMessage(
    conversationId: number | string,
    content: string
): Promise<SendMessageResponse> {
    return postData<SendMessageResponse, { content: string }>(
        `/api/conversations/${conversationId}/messages`,
        { content }
    );
}