import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../api/client";
import {
    Send,
    Sparkles,
} from "lucide-react";
import FileViewerPanel from "./FileViewerPanel.tsx";

type MessageResponse = {
    id: number;
    role: "USER" | "ASSISTANT";
    content: string;
    createdAt: string;
};

type SendMessageResponse = {
    messages?: MessageResponse[];
};

type ConversationMessage =
    | {
    id: string;
    role: "user";
    text: string;
    createdAt: number;
}
    | {
    id: string;
    role: "assistant";
    text: string;
    createdAt: number;
    loading?: boolean;
};

export default function ConversationPage() {

    const { workspaceId: wsParam, conversationId: conversationParam } = useParams();

    const workspaceId = Number(wsParam);
    const conversationId = Number(conversationParam);

    const [q, setQ] = useState("");

    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const listRef = useRef<HTMLDivElement | null>(null);

    const canAsk = useMemo(() => {
        return !!q.trim() && !loading && workspaceId && conversationId;
    }, [q, loading, workspaceId, conversationId]);

    useEffect(() => {
        if (!conversationId) return;

        const fetchMessages = async () => {
            const res = await api.get(`/api/conversations/${conversationId}/messages`);

            console.log("GET messages:", res.data);

            setMessages(
                (res.data ?? []).map((m: any) => ({
                    id: m?.id?.toString?.() ?? crypto.randomUUID(),
                    role: m?.role?.toLowerCase() === "user" ? "user" : "assistant",
                    text: m?.content ?? "",
                    createdAt: m?.createdAt
                        ? new Date(m.createdAt).getTime()
                        : Date.now(),
                }))
            );
        };

        fetchMessages();
    }, [conversationId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            listRef.current?.scrollTo({
                top: listRef.current.scrollHeight,
                behavior: "smooth",
            });
        }, 0);
    };

    const ask = async () => {
        const text = q.trim();
        if (!text) return;

        const tempUserId = crypto.randomUUID();
        const tempAssistantId = crypto.randomUUID();

        setMessages(prev => [
            ...prev,
            { id: tempUserId, role: "user", text, createdAt: Date.now() },
            {
                id: tempAssistantId,
                role: "assistant",
                text: "생성 중...",
                createdAt: Date.now(),
                loading: true
            }
        ]);

        setQ("");
        scrollToBottom();

        try {
            setLoading(true);

            const res = await api.post<SendMessageResponse>(
                `/api/conversations/${conversationId}/messages`,
                { content: text }
            );

            console.log("POST response:", res.data);

            const serverMessages = res.data?.messages ?? [];

            const userMsg = serverMessages[0];
            const assistantMsg = serverMessages[1];

            if (!userMsg || !assistantMsg) {
                console.error("응답 구조 이상:", res.data);

                setMessages(prev =>
                    prev.map(m =>
                        m.id === tempAssistantId
                            ? { ...m, loading: false, text: "응답 오류" }
                            : m
                    )
                );

                return;
            }

            setMessages(prev =>
                prev.map(m => {
                    if (m.id === tempUserId) {
                        return {
                            id: userMsg.id?.toString?.() ?? tempUserId,
                            role: "user",
                            text: userMsg.content ?? "",
                            createdAt: userMsg.createdAt
                                ? new Date(userMsg.createdAt).getTime()
                                : Date.now()
                        };
                    }

                    if (m.id === tempAssistantId) {
                        return {
                            id: assistantMsg.id?.toString?.() ?? tempAssistantId,
                            role: "assistant",
                            text: assistantMsg.content ?? "응답 없음",
                            createdAt: assistantMsg.createdAt
                                ? new Date(assistantMsg.createdAt).getTime()
                                : Date.now(),
                            loading: false
                        };
                    }

                    return m;
                })
            );

        } catch (e) {
            console.error("질문 실패", e);

            setMessages(prev =>
                prev.map(m =>
                    m.id === tempAssistantId
                        ? { ...m, loading: false, text: "질문 실패" }
                        : m
                )
            );
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    };

    const onEnterAsk = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") ask();
    };

    return (
        <div className="grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-4">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-black text-slate-900">
                        <Sparkles className="h-5 w-5 text-primary-600"/>
                        문서 Q&A
                    </h1>
                </div>

                <Card>

                    <div
                        ref={listRef}
                        className="h-[520px] overflow-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4"
                    >
                        {messages.length === 0 ? (
                            <div className="grid h-full place-items-center">
                                <div className="text-center">
                                    <div
                                        className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-primary-50 text-primary-700">
                                        <Sparkles className="h-5 w-5"/>
                                    </div>
                                    <div className="text-sm font-bold text-slate-700">문서 기준으로 질문해보세요</div>
                                    <div className="mt-1 text-xs text-slate-400">예: “evido 사용방법을 알려줘”, “문서기반 검색 서비스가
                                        뭐야?”
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map(m => {
                                    const isUser = m.role === "user";
                                    return (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                                                    isUser
                                                        ? "bg-primary-500 text-white shadow"
                                                        : "bg-white border shadow-sm"
                                                }`}
                                            >
                                                {m.text}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-3 flex gap-2">
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={onEnterAsk}
                            placeholder="질문을 입력하세요 (Enter 전송)"
                        />
                        <Button onClick={ask} disabled={!canAsk}>
                            <Send size={14}/>
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-5">
                <FileViewerPanel workspaceId={workspaceId}/>
            </div>
        </div>
    );
}