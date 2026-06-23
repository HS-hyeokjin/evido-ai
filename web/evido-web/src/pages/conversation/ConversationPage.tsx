import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

import Button from "../../components/common/Button";
import FileViewerPanel from "./FileViewerPanel";
import {
    getConversationMessages,
    sendConversationMessageStream,
    sendFirstMessageStream,
} from "../../api/conversations";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import type {
    ConversationMessage,
    MessageResponse,
} from "../../types/Conversation";
import type { ChatStreamEvent } from "../../types/ChatStream";

const STARTER_PROMPTS = [
    "문서의 내용을 요약해줘",
    "중요한 개념만 쉽게 설명해줘",
    "이 문서의 결론과 핵심 근거를 알려줘",
    "시험에 나올 만한 내용을 정리해줘",
    "회의에서 공유할 수 있게 요약해줘",
];

function toConversationMessage(message: MessageResponse): ConversationMessage {
    return {
        id: message.id?.toString?.() ?? crypto.randomUUID(),
        role:
            message.role?.toLowerCase() === "user"
                ? "user"
                : "assistant",
        text: message.content ?? "",
        createdAt: message.createdAt
            ? new Date(message.createdAt).getTime()
            : Date.now(),
    };
}

function toMessageTime(createdAt?: string | null) {
    if (!createdAt) return Date.now();

    const time = new Date(createdAt).getTime();

    return Number.isNaN(time) ? Date.now() : time;
}

export default function ConversationPage() {
    const { workspaceId: wsParam, conversationId: conversationParam } = useParams();
    const navigate = useNavigate();

    const workspaceId = Number(wsParam);
    const isValidWorkspaceId = !Number.isNaN(workspaceId) && workspaceId > 0;

    const isNewConversation = conversationParam === "new";
    const conversationId = isNewConversation ? null : Number(conversationParam);
    const isValidConversationId =
        isNewConversation ||
        (!!conversationId && !Number.isNaN(conversationId) && conversationId > 0);

    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);

    const endRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const streamAbortRef = useRef<AbortController | null>(null);

    const canAsk = useMemo(() => {
        return !!q.trim() && !loading && isValidWorkspaceId && isValidConversationId;
    }, [q, loading, isValidWorkspaceId, isValidConversationId]);

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
        if (isNewConversation) {
            setMessages([]);
            return;
        }

        if (!conversationId || Number.isNaN(conversationId)) {
            setMessages([]);
            return;
        }

        let cancelled = false;

        const fetchMessages = async () => {
            try {
                const serverMessages = await getConversationMessages(conversationId);

                if (cancelled) return;

                const mapped = serverMessages.map(toConversationMessage);

                setMessages(mapped);
                requestAnimationFrame(() => scrollToBottom("auto"));
            } catch (error) {
                console.error("메시지 조회 실패", error);

                if (!cancelled) {
                    setMessages([]);
                }
            }
        };

        void fetchMessages();

        return () => {
            cancelled = true;
        };
    }, [conversationId, isNewConversation]);

    useEffect(() => {
        return () => {
            streamAbortRef.current?.abort();
        };
    }, []);

    const ask = async (overrideText?: string) => {
        const text = (overrideText ?? q).trim();

        if (!text || !isValidWorkspaceId || loading) return;

        if (!isNewConversation && (!conversationId || Number.isNaN(conversationId))) {
            return;
        }

        if (isNewConversation) {
            await askFirstMessageStreaming(text);
            return;
        }

        await askStreamingMessage(conversationId!, text);
    };

    const askFirstMessageStreaming = async (text: string) => {
        const tempUserId = crypto.randomUUID();
        const tempAssistantId = crypto.randomUUID();
        const abortController = new AbortController();

        streamAbortRef.current?.abort();
        streamAbortRef.current = abortController;

        let assistantText = "";
        let completed = false;
        let createdConversationId: number | null = null;

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
                text: "질문을 분석하고 있습니다...",
                createdAt: Date.now(),
                loading: true,
            },
        ]);

        setQ("");
        setLoading(true);

        try {
            await sendFirstMessageStream(workspaceId, text, {
                signal: abortController.signal,
                onEvent: (event) => {
                    handleStreamEvent({
                        event,
                        tempUserId,
                        tempAssistantId,
                        fallbackUserText: text,
                        getAssistantText: () => assistantText,
                        setAssistantText: (value) => {
                            assistantText = value;
                        },
                        markCompleted: () => {
                            completed = true;
                        },
                    });

                    if (event.type === "user_message") {
                        createdConversationId = event.conversationId;
                    }

                    if (event.type === "done") {
                        createdConversationId = event.conversationId;
                    }
                },
            });

            if (!completed) {
                setMessages((prev) =>
                    prev.map((message) =>
                        message.id === tempAssistantId
                            ? {
                                ...message,
                                loading: false,
                                text: assistantText || "응답이 완료되지 않았습니다.",
                            }
                            : message
                    )
                );
            }

            if (createdConversationId) {
                navigate(
                    `/workspace/${workspaceId}/conversation/${createdConversationId}`,
                    { replace: true }
                );
            }
        } catch (error) {
            if (abortController.signal.aborted) {
                finishAbortedAssistantMessage(tempAssistantId, assistantText);
                return;
            }

            console.error("첫 메시지 스트리밍 실패", error);

            const errorMessage = getApiErrorMessage(error);

            setMessages((prev) =>
                prev.map((message) =>
                    message.id === tempAssistantId
                        ? {
                            ...message,
                            loading: false,
                            text: errorMessage || "질문 처리 중 오류가 발생했습니다.",
                        }
                        : message
                )
            );
        } finally {
            if (streamAbortRef.current === abortController) {
                streamAbortRef.current = null;
            }

            setLoading(false);
        }
    };

    const askStreamingMessage = async (
        targetConversationId: number,
        text: string
    ) => {
        const tempUserId = crypto.randomUUID();
        const tempAssistantId = crypto.randomUUID();
        const abortController = new AbortController();

        streamAbortRef.current?.abort();
        streamAbortRef.current = abortController;

        let assistantText = "";
        let completed = false;

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
                text: "질문을 분석하고 있습니다...",
                createdAt: Date.now(),
                loading: true,
            },
        ]);

        setQ("");
        setLoading(true);

        try {
            await sendConversationMessageStream(targetConversationId, text, {
                signal: abortController.signal,
                onEvent: (event) => {
                    handleStreamEvent({
                        event,
                        tempUserId,
                        tempAssistantId,
                        fallbackUserText: text,
                        getAssistantText: () => assistantText,
                        setAssistantText: (value) => {
                            assistantText = value;
                        },
                        markCompleted: () => {
                            completed = true;
                        },
                    });
                },
            });

            if (!completed) {
                setMessages((prev) =>
                    prev.map((message) =>
                        message.id === tempAssistantId
                            ? {
                                ...message,
                                loading: false,
                                text: assistantText || "응답이 완료되지 않았습니다.",
                            }
                            : message
                    )
                );
            }
        } catch (error) {
            if (abortController.signal.aborted) {
                finishAbortedAssistantMessage(tempAssistantId, assistantText);
                return;
            }

            console.error("스트리밍 질문 실패", error);

            const errorMessage = getApiErrorMessage(error);

            setMessages((prev) =>
                prev.map((message) =>
                    message.id === tempAssistantId
                        ? {
                            ...message,
                            loading: false,
                            text: errorMessage || "질문 처리 중 오류가 발생했습니다.",
                        }
                        : message
                )
            );
        } finally {
            if (streamAbortRef.current === abortController) {
                streamAbortRef.current = null;
            }

            setLoading(false);
        }
    };

    const cancelStreaming = () => {
        if (!streamAbortRef.current) return;

        streamAbortRef.current.abort();
        streamAbortRef.current = null;
    };

    const finishAbortedAssistantMessage = (
        tempAssistantId: string,
        assistantText: string
    ) => {
        setMessages((prev) =>
            prev.map((message) => {
                if (message.id !== tempAssistantId) {
                    return message;
                }

                const text = assistantText.trim();

                return {
                    ...message,
                    loading: false,
                    text: text
                        ? `${text}\n\n[응답 생성이 중단되었습니다.]`
                        : "응답 생성이 중단되었습니다.",
                };
            })
        );
    };


    const handleStreamEvent = ({
                                   event,
                                   tempUserId,
                                   tempAssistantId,
                                   fallbackUserText,
                                   getAssistantText,
                                   setAssistantText,
                                   markCompleted,
                               }: {
        event: ChatStreamEvent;
        tempUserId: string;
        tempAssistantId: string;
        fallbackUserText: string;
        getAssistantText: () => string;
        setAssistantText: (value: string) => void;
        markCompleted: () => void;
    }) => {
        if (event.type === "user_message") {
            setMessages((prev) =>
                prev.map((message) =>
                    message.id === tempUserId
                        ? {
                            id: String(event.messageId),
                            role: "user" as const,
                            text: event.content || fallbackUserText,
                            createdAt: toMessageTime(event.createdAt),
                        }
                        : message
                )
            );

            return;
        }

        if (event.type === "status") {
            const currentAssistantText = getAssistantText();

            if (currentAssistantText) {
                return;
            }

            setMessages((prev) =>
                prev.map((message) =>
                    message.id === tempAssistantId
                        ? {
                            ...message,
                            text: `${event.message}...`,
                            loading: true,
                        }
                        : message
                )
            );

            return;
        }

        if (event.type === "evidence") {
            // 지금 단계에서는 근거를 화면에 표시하지 않는다.
            // 나중에 답변 하단 근거 표시 기능을 붙일 때 event.evidences를 사용하면 된다.
            return;
        }

        if (event.type === "token") {
            const nextText = getAssistantText() + event.content;

            setAssistantText(nextText);

            setMessages((prev) =>
                prev.map((message) =>
                    message.id === tempAssistantId
                        ? {
                            ...message,
                            text: nextText,
                            loading: true,
                        }
                        : message
                )
            );

            return;
        }

        if (event.type === "done") {
            markCompleted();

            const finalText = getAssistantText();

            setMessages((prev) =>
                prev.map((message) =>
                    message.id === tempAssistantId
                        ? {
                            id: String(event.messageId),
                            role: "assistant" as const,
                            text: finalText || "응답 없음",
                            createdAt: toMessageTime(event.createdAt),
                            loading: false,
                        }
                        : message
                )
            );

            return;
        }

        if (event.type === "error") {
            setMessages((prev) =>
                prev.map((message) =>
                    message.id === tempAssistantId
                        ? {
                            ...message,
                            text: event.message || "스트리밍 중 오류가 발생했습니다.",
                            loading: false,
                        }
                        : message
                )
            );
        }
    };

    const onEnterAsk = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void ask();
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
                                        {STARTER_PROMPTS.filter(Boolean).map((prompt) => (
                                            <button
                                                key={prompt}
                                                type="button"
                                                disabled={
                                                    loading ||
                                                    !isValidWorkspaceId ||
                                                    !isValidConversationId
                                                }
                                                onClick={() => void ask(prompt)}
                                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                                {messages.map((message) => {
                                    const isUser = message.role === "user";

                                    if (isUser) {
                                        return (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.18 }}
                                                className="flex justify-end"
                                            >
                                                <div className="max-w-2xl whitespace-pre-wrap break-words rounded-[28px] bg-primary-400 px-5 py-4 text-[15px] leading-7 text-white shadow-[0_16px_40px_rgba(109,40,217,0.18)]">
                                                    {message.text}
                                                </div>
                                            </motion.div>
                                        );
                                    }

                                    return (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="flex gap-4"
                                        >
                                            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                                                <Sparkles className="h-5 w-5 text-primary-600" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    Assistant
                                                </div>

                                                <div className="whitespace-pre-wrap break-words rounded-[30px] border border-slate-200 bg-white px-6 py-5 text-[15px] leading-7 text-slate-800 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
                                                    {message.text}
                                                    {"loading" in message && message.loading ? (
                                                        <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-primary-400 align-middle" />
                                                    ) : null}
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

                                {loading ? (
                                    <button
                                        type="button"
                                        onClick={cancelStreaming}
                                        className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
                                    >
                                        중단
                                    </button>
                                ) : (
                                    <Button
                                        onClick={() => void ask()}
                                        disabled={!canAsk}
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-full shadow-sm"
                                    >
                                        <Send size={16} />
                                    </Button>
                                )}
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