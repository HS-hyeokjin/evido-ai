import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../api/client";
import {
    SlidersHorizontal,
    Send,
    Sparkles,
} from "lucide-react";
import FileViewerPanel from "./FileViewerPanel.tsx";

/** ===== 타입 ===== */

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

/** ===== 컴포넌트 ===== */

export default function ConversationPage() {

    const { workspaceId: wsParam, conversationId: conversationParam } = useParams();

    const workspaceId = Number(wsParam);
    const conversationId = Number(conversationParam);

    const [q, setQ] = useState("");
    const [topK, setTopK] = useState<number>(5);

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

    /** ===== 스크롤 ===== */
    const scrollToBottom = () => {
        setTimeout(() => {
            listRef.current?.scrollTo({
                top: listRef.current.scrollHeight,
                behavior: "smooth",
            });
        }, 0);
    };

    /** ===== 메시지 전송 ===== */
    const ask = async () => {
        const text = q.trim();
        if (!text) return;

        const tempUserId = crypto.randomUUID();
        const tempAssistantId = crypto.randomUUID();

        /** optimistic UI */
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

            /** 🔥 응답 검증 */
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

            /** 상태 업데이트 */
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

    /** ===== UI ===== */
    return (
        <div className="grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">

            {/* LEFT */}
            <div className="lg:col-span-7 flex flex-col">

                <div className="flex justify-between items-center mb-4">
                    <h1 className="flex items-center gap-2 text-2xl font-black">
                        <Sparkles className="h-5 w-5 text-primary-600"/>
                        문서 Q&A
                    </h1>
                </div>

                <Card>
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <SlidersHorizontal size={14}/>
                        검색 설정
                    </div>

                    <div className="mt-3 flex gap-2">
                        <Input
                            value={topK}
                            onChange={(e) => setTopK(Number(e.target.value))}
                        />
                    </div>
                </Card>

                <div className="flex flex-col flex-1 mt-4">

                    <div
                        ref={listRef}
                        className="flex-1 overflow-auto rounded-2xl bg-gradient-to-b from-slate-50 to-white p-4 border"
                    >
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-400 mt-24">
                                AI에게 질문을 시작해보세요
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
                                                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                                                    isUser
                                                        ? "bg-primary-600 text-white shadow"
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
                            placeholder="문서 기반으로 질문해보세요..."
                        />
                        <Button onClick={ask} disabled={!canAsk}>
                            <Send size={14}/>
                        </Button>
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-5">
                <FileViewerPanel workspaceId={workspaceId}/>
            </div>
        </div>
    );
}