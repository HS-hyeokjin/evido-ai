export interface ConversationResponse {
    id: number;
    workspaceId?: number;
    title: string;
    createdAt: string;
}

export interface ConversationListItem {
    id: string;
    workspaceId?: number;
    title: string;
    createdAt: number;
}

export interface MessageResponse {
    id: number;
    role: string;
    content: string;
    createdAt: string;
}

export interface SendMessageResponse {
    conversationId: number;
    messages?: MessageResponse[];
}

export type ConversationRole = "user" | "assistant";

export interface BaseConversationMessage {
    id: string;
    role: ConversationRole;
    text: string;
    createdAt: number;
}

export interface UserConversationMessage extends BaseConversationMessage {
    role: "user";
}

export interface AssistantConversationMessage extends BaseConversationMessage {
    role: "assistant";
    loading?: boolean;
}

export type ConversationMessage =
    | UserConversationMessage
    | AssistantConversationMessage;