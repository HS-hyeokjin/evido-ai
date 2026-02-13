import { useMemo, useRef, useState } from "react";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../api/client";

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
    queryText?: string;
    evidences?: Evidence[];
    sourcesOpen?: boolean;
    loading?: boolean;
};

export default function AskPage() {
    const [q, setQ] = useState("");
    const [documentId, setDocumentId] = useState<number | "">("");
    const [versionId, setVersionId] = useState<number | "">("");
    const [topK, setTopK] = useState<number>(5);

    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const listRef = useRef<HTMLDivElement | null>(null);

    const canAsk = useMemo(() => {
        return !!q.trim() && documentId !== "" && versionId !== "" && !loading;
    }, [q, documentId, versionId, loading]);

    const scrollToBottom = () => {
        setTimeout(() => {
            listRef.current?.scrollTo({
                top: listRef.current.scrollHeight,
                behavior: "smooth",
            });
        }, 0);
    };

    const toggleSources = (assistantMsgId: string) => {
        setMessages((prev) =>
            prev.map((m) => {
                if (m.role !== "assistant") return m;
                if (m.id !== assistantMsgId) return m;
                return { ...m, sourcesOpen: !m.sourcesOpen };
            })
        );
    };

    const ask = async () => {
        const text = q.trim();
        if (!text) return;

        if (documentId === "" || versionId === "") {
            alert("documentId / versionId 값이 없습니다.");
            return;
        }

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            text,
            createdAt: Date.now(),
        };

        const assistantPlaceholderId = crypto.randomUUID();
        const assistantMsg: ChatMessage = {
            id: assistantPlaceholderId,
            role: "assistant",
            text: "생성 중...",
            createdAt: Date.now(),
            loading: true,
            sourcesOpen: false,
            evidences: [],
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setQ("");
        scrollToBottom();

        try {
            setLoading(true);

            const payload = {
                queryText: text,
                documentId: Number(documentId),
                versionId: Number(versionId),
                topK: Number(topK),
            };

            const res = await api.post<AskResponse>("/api/qa/answer", payload);

            setMessages((prev) =>
                prev.map((m) => {
                    if (m.role !== "assistant") return m;
                    if (m.id !== assistantPlaceholderId) return m;

                    return {
                        ...m,
                        loading: false,
                        text: res.data.answer ?? "",
                        queryText: res.data.queryText,
                        evidences: res.data.evidences ?? [],
                        sourcesOpen: false,
                    };
                })
            );

            scrollToBottom();
        } catch (e: any) {
            console.error(e);
            const msg = e?.response?.data?.message ?? "질문 실패(/api/qa/answer 백엔드 확인)";

            setMessages((prev) =>
                prev.map((m) => {
                    if (m.role !== "assistant") return m;
                    if (m.id !== assistantPlaceholderId) return m;
                    return { ...m, loading: false, text: msg, evidences: [], sourcesOpen: false };
                })
            );

            scrollToBottom();
        } finally {
            setLoading(false);
        }
    };

    const onEnterAsk = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") ask();
    };

    return (
        <div className="max-w-4xl space-y-4">
            <h1 className="text-xl font-black">문서 Q&A (채팅)</h1>

            <Card>
                <div className="grid gap-3">
                    <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                            value={documentId}
                            onChange={(e) => setDocumentId(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="documentId (예: 1)"
                        />
                        <Input
                            value={versionId}
                            onChange={(e) => setVersionId(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="versionId (예: 1)"
                        />
                        <Input
                            value={topK}
                            onChange={(e) => setTopK(Number(e.target.value))}
                            placeholder="topK (기본 5)"
                        />
                    </div>

                    <div className="text-xs text-slate-500">
                        * 호출: POST /api/qa/answer (queryText, documentId, versionId, topK)
                    </div>
                </div>
            </Card>

            <Card>
                <div
                    ref={listRef}
                    className="h-[480px] overflow-auto rounded-xl bg-slate-50 p-3 space-y-3"
                >
                    {messages.length === 0 ? (
                        <div className="text-sm text-slate-500">
                            문서(documentId/versionId)를 지정하고 질문해주세요.
                        </div>
                    ) : (
                        messages.map((m) => {
                            const isUser = m.role === "user";
                            return (
                                <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={[
                                            "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                                            isUser ? "bg-black text-white" : "bg-white text-slate-900",
                                        ].join(" ")}
                                    >
                                        <div className="whitespace-pre-wrap">{m.text}</div>

                                        {m.role === "assistant" && !m.loading && (
                                            <div className="mt-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSources(m.id)}
                                                        className="text-xs font-bold text-slate-600 hover:underline"
                                                    >
                                                        {m.sourcesOpen ? "근거 닫기" : "근거 보기"}
                                                    </button>
                                                    <span className="text-[11px] text-slate-400">
                            {m.evidences?.length ? `${m.evidences.length}개` : "0개"}
                          </span>
                                                </div>

                                                {m.sourcesOpen && (
                                                    <div className="mt-2 rounded-xl border bg-slate-50 p-3">
                                                        {m.evidences?.length ? (
                                                            <ul className="list-disc space-y-2 pl-5 text-xs">
                                                                {m.evidences.map((e, idx) => (
                                                                    <li key={idx}>
                                                                        <div className="font-extrabold text-slate-700">
                                                                            chunk #{e.chunkId ?? "?"} · index {e.chunkIndex ?? "?"} · score{" "}
                                                                            {typeof e.score === "number" ? e.score.toFixed(4) : "?"}
                                                                        </div>
                                                                        <div className="mt-1 whitespace-pre-wrap text-slate-500">
                                                                            {e.contentHead ?? "(contentHead 없음)"}
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div className="text-xs text-slate-500">근거 데이터가 없습니다.</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="mt-3 flex gap-2">
                    <div className="flex-1">
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={onEnterAsk}
                            placeholder="문서 기반으로 질문 (예: 점검 주기는?)"
                        />
                    </div>
                    <Button onClick={ask} disabled={!canAsk}>
                        {loading ? "생성 중..." : "전송"}
                    </Button>
                </div>

                {(documentId === "" || versionId === "") && (
                    <div className="mt-2 text-xs text-amber-600">
                        documentId / versionId 를 입력해야 합니다.
                    </div>
                )}
            </Card>
        </div>
    );
}
