import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../components/common/Button";
import api from "../../api/client";
import { Send, Sparkles } from "lucide-react";
import FileViewerPanel from "./FileViewerPanel.tsx";

type MessageResponse = {
    id: number;
    role: string;
    content: string;
    createdAt: string;
};

type SendMessageResponse = {
    conversationId: number;
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

const STARTER_PROMPTS = [
    "이 문서의 핵심 내용을 요약해줘",
    "중요한 개념만 쉽게 설명해줘",
    "실무에 적용할 포인트를 알려줘",
];

export default function ConversationPage() {
    const { workspaceId: wsParam, conversationId: conversationParam } = useParams();
    const navigate = useNavigate();

    const workspaceId = Number(wsParam);
    const isNewConversation = conversationParam === "new";
    const conversationId = isNewConversation ? null : Number(conversationParam);

    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);

    const endRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const canAsk = useMemo(() => {
        return !!q.trim() && !loading && !!workspaceId;
    }, [q, loading, workspaceId]);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        requestAnimationFrame(() => {
            endRef.current?.scrollIntoView({
                behavior,
                block: "end",
            });
        });
    };

    useEffect(() => {
        if (!textareaRef.current) return;

        textareaRef.current.style.height = "0px";
        textareaRef.current.style.height = `${Math.min(
            textareaRef.current.scrollHeight,
            200
        )}px`;
    }, [q]);

    useEffect(() => {
        if (messages.length === 0) return;
        scrollToBottom("smooth");
    }, [messages]);

    useEffect(() => {
        if (isNewConversation || !conversationId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/api/conversations/${conversationId}/messages`);

                const mapped = (res.data ?? []).map((m: any) => ({
                    id: m?.id?.toString?.() ?? crypto.randomUUID(),
                    role: m?.role?.toLowerCase() === "user" ? "user" : "assistant",
                    text: m?.content ?? "",
                    createdAt: m?.createdAt
                        ? new Date(m.createdAt).getTime()
                        : Date.now(),
                }));

                setMessages(mapped);
                requestAnimationFrame(() => scrollToBottom("auto"));
            } catch (e) {
                console.error("메시지 조회 실패", e);
            }
        };

        fetchMessages();
    }, [conversationId, isNewConversation]);

    const ask = async (overrideText?: string) => {
        const text = (overrideText ?? q).trim();
        if (!text || !workspaceId || loading) return;

        const tempUserId = crypto.randomUUID();
        const tempAssistantId = crypto.randomUUID();

        setMessages((prev) => [
            ...prev,
            {
                id: tempUserId,
                role: "user",
                text,
                createdAt: Date.now(),
            },
            {
                id: tempAssistantId,
                role: "assistant",
                text: "생성 중...",
                createdAt: Date.now(),
                loading: true,
            },
        ]);

        setQ("");
        setLoading(true);

        try {
            const url = isNewConversation
                ? `/api/conversations/workspaces/${workspaceId}/first-message`
                : `/api/conversations/${conversationId}/messages`;

            const res = await api.post<SendMessageResponse>(url, {
                content: text,
            });

            const serverMessages = res.data?.messages ?? [];
            const userMsg = serverMessages[0];
            const assistantMsg = serverMessages[1];

            if (!userMsg || !assistantMsg) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === tempAssistantId
                            ? { ...m, loading: false, text: "응답 오류" }
                            : m
                    )
                );
                return;
            }

            setMessages((prev) =>
                prev.map((m) => {
                    if (m.id === tempUserId) {
                        return {
                            id: userMsg.id?.toString?.() ?? tempUserId,
                            role: "user" as const,
                            text: userMsg.content ?? "",
                            createdAt: userMsg.createdAt
                                ? new Date(userMsg.createdAt).getTime()
                                : Date.now(),
                        };
                    }

                    if (m.id === tempAssistantId) {
                        return {
                            id: assistantMsg.id?.toString?.() ?? tempAssistantId,
                            role: "assistant" as const,
                            text: assistantMsg.content ?? "응답 없음",
                            createdAt: assistantMsg.createdAt
                                ? new Date(assistantMsg.createdAt).getTime()
                                : Date.now(),
                            loading: false,
                        };
                    }

                    return m;
                })
            );

            if (isNewConversation && res.data.conversationId) {
                navigate(
                    `/workspace/${workspaceId}/conversation/${res.data.conversationId}`,
                    { replace: true }
                );
            }
        } catch (e) {
            console.error("질문 실패", e);

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === tempAssistantId
                        ? { ...m, loading: false, text: "질문 실패" }
                        : m
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const onEnterAsk = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            ask();
        }
    };

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="min-w-0">
                <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col">
                    <header className="px-2 pb-3 pt-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI 문서 대화
                        </div>

                        <h1 className="mt-4 text-[28px] font-black tracking-tight text-slate-900">
                            문서를 더 자연스럽게
                            <br className="hidden sm:block" />
                            질문하고 답변받아보세요
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            업로드한 문서를 바탕으로 핵심 요약, 개념 설명, 실무 포인트까지
                            대화형으로 확인할 수 있습니다.
                        </p>
                    </header>

                    {messages.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center px-2 pb-32 pt-8">
                            <div className="w-full max-w-3xl">
                                <div className="rounded-[32px] border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50 ring-1 ring-primary-100">
                                        <Sparkles className="h-7 w-7 text-primary-600" />
                                    </div>

                                    <div className="text-center">
                                        <h2 className="text-xl font-bold text-slate-800">
                                            무엇이든 문서 기준으로 물어보세요
                                        </h2>
                                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                                            긴 문서를 직접 읽지 않아도 괜찮아요.
                                            핵심만 요약하거나, 어려운 부분만 골라서 쉽게 설명받을 수 있어요.
                                        </p>
                                    </div>

                                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                                        {STARTER_PROMPTS.map((prompt) => (
                                            <button
                                                key={prompt}
                                                type="button"
                                                onClick={() => setQ(prompt)}
                                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 px-2 pb-40 pt-6">
                            <div className="space-y-8">
                                {messages.map((m) => {
                                    const isUser = m.role === "user";

                                    if (isUser) {
                                        return (
                                            <motion.div
                                                key={m.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.18 }}
                                                className="flex justify-end"
                                            >
                                                <div className="max-w-2xl rounded-[28px] bg-primary-400 px-5 py-4 text-[15px] leading-7 text-white shadow-[0_16px_40px_rgba(109,40,217,0.18)] whitespace-pre-wrap break-words">
                                                    {m.text}
                                                </div>
                                            </motion.div>
                                        );
                                    }

                                    return (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="flex gap-4"
                                        >
                                            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm">
                                                <Sparkles className="h-5 w-5 text-primary-600" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    Assistant
                                                </div>
                                                <div className="rounded-[30px] border border-slate-200 bg-white px-6 py-5 text-[15px] leading-7 text-slate-800 shadow-[0_12px_40px_rgba(15,23,42,0.05)] whitespace-pre-wrap break-words">
                                                    {m.text}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div ref={endRef} />
                        </div>
                    )}

                    <div className="sticky bottom-0 left-0 right-0 mt-auto px-2 pb-3 pt-6">
                        <div className="rounded-[30px] border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                            <div className="px-5 pt-5">
                                <textarea
                                    ref={textareaRef}
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    onKeyDown={onEnterAsk}
                                    placeholder="문서에 대해 질문해보세요. Enter 전송 / Shift+Enter 줄바꿈"
                                    rows={1}
                                    className="max-h-[200px] min-h-[32px] w-full resize-none overflow-y-auto border-0 bg-transparent text-[15px] leading-7 text-slate-800 outline-none placeholder:text-slate-400"
                                />
                            </div>

                            <div className="flex items-center justify-between px-4 pb-4 pt-3">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                        문서 근거 기반
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                        Enter 전송
                                    </span>
                                </div>

                                <Button
                                    onClick={() => ask()}
                                    disabled={!canAsk}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-full shadow-sm"
                                >
                                    <Send size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <aside className="min-w-0">
                <div className="lg:sticky lg:top-6">
                    <FileViewerPanel workspaceId={workspaceId} />
                </div>
            </aside>
        </div>
    );
}