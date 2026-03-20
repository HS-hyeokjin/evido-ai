import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../api/client";
import {
    SlidersHorizontal,
    Send,
    Sparkles,
} from "lucide-react";
import FileViewerPanel from "../chat/FileViewerPanel.tsx";

type Evidence = {
    chunkId: number | null;
    score: number | null;
    chunkIndex: number | null;
    contentHead: string | null;
};

type AskResponse = {
    queryText: string;
    answer: string;
    evidences: Evidence[];
};

type ChatMessage =
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
    evidences?: Evidence[];
    sourcesOpen?: boolean;
    loading?: boolean;
};

export default function AskPage() {

    const { workspaceId: wsParam, chatId: chatParam } = useParams();

    const workspaceId = Number(wsParam);
    const chatId = Number(chatParam);

    const [q, setQ] = useState("");
    const [topK, setTopK] = useState<number>(5);

    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const listRef = useRef<HTMLDivElement | null>(null);

    const canAsk = useMemo(() => {
        return !!q.trim() && !loading && workspaceId && chatId;
    }, [q, loading, workspaceId, chatId]);

    useEffect(() => {
        if (!chatId) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/api/chats/${chatId}/messages`);

                setMessages(
                    res.data.map((m: any) => ({
                        id: m.id.toString(),
                        role: m.role === "USER" ? "user" : "assistant",
                        text: m.content,
                        createdAt: new Date(m.createdAt).getTime(),
                    }))
                );
            } catch (e) {
                console.error("메시지 로딩 실패", e);
            }
        };

        fetchMessages();
    }, [chatId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            listRef.current?.scrollTo({
                top: listRef.current.scrollHeight,
                behavior: "smooth",
            });
        }, 0);
    };

    const toggleSources = (id: string) => {
        setMessages(prev =>
            prev.map(m =>
                m.id === id ? { ...m, sourcesOpen: !m.sourcesOpen } : m
            )
        );
    };

    const ask = async () => {
        const text = q.trim();
        if (!text) return;

        const userId = crypto.randomUUID();
        const assistantId = crypto.randomUUID();

        setMessages(prev => [
            ...prev,
            { id: userId, role: "user", text, createdAt: Date.now() },
            {
                id: assistantId,
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

            const res = await api.post<AskResponse>("/api/qa/answer", {
                queryText: text,
                workspaceId,
                chatId,
                topK,
            });

            const answer = res.data.answer;

            await api.post(`/api/chats/${chatId}/messages`, {
                question: text,
                answer,
            });

            setMessages(prev =>
                prev.map(m =>
                    m.id === assistantId
                        ? {
                            ...m,
                            loading: false,
                            text: answer,
                            evidences: res.data.evidences,
                            sourcesOpen: false,
                        }
                        : m
                )
            );

        } catch (e: any) {
            console.error(e);

            setMessages(prev =>
                prev.map(m =>
                    m.id === assistantId
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

    if (!workspaceId || !chatId) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                잘못된 접근입니다
            </div>
        );
    }

    return (
        <div className="grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-12">

            <div className="lg:col-span-7 space-y-4">

                <div className="flex justify-between items-center">
                    <h1 className="flex items-center gap-2 text-xl font-black">
                        <Sparkles className="h-5 w-5 text-primary-600"/>
                        문서 Q&A
                    </h1>

                    <div className="text-xs text-slate-500">
                        Workspace #{workspaceId} / Chat #{chatId}
                    </div>
                </div>

                <Card>
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <SlidersHorizontal size={14}/>
                        검색 설정
                    </div>

                    <div className="mt-3">
                        <Input
                            value={topK}
                            onChange={(e) => setTopK(Number(e.target.value))}
                            placeholder="topK"
                        />
                    </div>
                </Card>

                <Card>
                    <div
                        ref={listRef}
                        className="h-[520px] overflow-auto border rounded-xl p-4 bg-slate-50"
                    >
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-400 mt-20">
                                질문을 입력해보세요
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {messages.map(m => {
                                    const isUser = m.role === "user";

                                    return (
                                        <div
                                            key={m.id}
                                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`px-4 py-2 rounded-xl ${
                                                    isUser
                                                        ? "bg-black text-white"
                                                        : "bg-white border"
                                                }`}
                                            >
                                                {m.text}

                                                {m.role === "assistant" && m.evidences && (
                                                    <div className="mt-2 text-xs">
                                                        <button
                                                            onClick={() => toggleSources(m.id)}
                                                            className="text-primary-600"
                                                        >
                                                            근거 보기
                                                        </button>

                                                        {m.sourcesOpen && (
                                                            <div className="mt-2 space-y-1">
                                                                {m.evidences.map((e, i) => (
                                                                    <div key={i} className="bg-slate-50 p-2 rounded">
                                                                        {e.contentHead}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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
                            placeholder="질문 입력"
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