import {useEffect, useMemo, useRef, useState} from "react";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../api/client";
import {SlidersHorizontal, Send, Sparkles, FileText, FolderOpen, RefreshCw, Search, Download,} from "lucide-react";
import TextViewer from "../../components/viewers/TextViewer";
import PdfViewer from "../../components/viewers/PdfViewer";

import {
    listDocuments,
    type DocumentListItem,
    type PageResponse,
    deleteDocument,
} from "../../api/documents";

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
    | { id: string; role: "user"; text: string; createdAt: number }
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

function getExt(name?: string | null) {
    if (!name) return "";
    const lower = name.toLowerCase();
    const dot = lower.lastIndexOf(".");
    return dot >= 0 ? lower.slice(dot + 1) : "";
}

export default function AskPage() {
    const [q, setQ] = useState("");
    const [workspaceId, setWorkspaceId] = useState<number>(1);
    const [topK, setTopK] = useState<number>(5);

    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const listRef = useRef<HTMLDivElement | null>(null);

    const canAsk = useMemo(() => !!q.trim() && !loading, [q, loading]);

    const [docListOpen, setDocListOpen] = useState(true);

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
                return {...m, sourcesOpen: !m.sourcesOpen};
            })
        );
    };

    const ask = async () => {
        const text = q.trim();
        if (!text) return;

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
                workspaceId: Number(workspaceId),
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
            const msg = e?.response?.data?.message ?? "질문 실패";

            setMessages((prev) =>
                prev.map((m) => {
                    if (m.role !== "assistant") return m;
                    if (m.id !== assistantPlaceholderId) return m;
                    return {...m, loading: false, text: msg, evidences: [], sourcesOpen: false};
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

    const [docLoading, setDocLoading] = useState(false);
    const [docError, setDocError] = useState<string | null>(null);
    const [docPage, setDocPage] = useState<PageResponse<DocumentListItem> | null>(null);

    const [docQuery, setDocQuery] = useState("");
    const [docPageNo, setDocPageNo] = useState(0);
    const docSize = 10;

    const [selectedDoc, setSelectedDoc] = useState<DocumentListItem | null>(null);

    const fetchDocs = async () => {
        try {
            setDocLoading(true);
            setDocError(null);

            const data = await listDocuments({
                query: docQuery || undefined,
                page: docPageNo,
                size: docSize,
                sort: "createdAt,desc",
            });

            setDocPage(data);

            if (selectedDoc && !data.content.some((x) => x.documentId === selectedDoc.documentId)) {
                setSelectedDoc(null);
            }
        } catch (e: any) {
            console.error(e);
            setDocError(e?.response?.data?.message ?? "문서 목록 조회 실패");
        } finally {
            setDocLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, [docPageNo, workspaceId]);

    const docs = docPage?.content ?? [];

    const selectedExt = getExt(selectedDoc?.filename);
    const isTextFile = selectedExt === "txt" || selectedExt === "md" || selectedExt === "markdown";
    const isPdf = selectedExt === "pdf";

    const textUrl = selectedDoc ? `/api/documents/${selectedDoc.documentId}/content` : "";
    const downloadUrl = selectedDoc
        ? `${window.location.origin}/api/documents/${selectedDoc.documentId}/download`
        : "";
    const onDeleteDoc = async (documentId: number) => {
        if (!confirm("문서를 삭제하시겠습니까?")) return;
        try {
            setDocLoading(true);
            await deleteDocument(documentId);
            await fetchDocs();
            if (selectedDoc?.documentId === documentId) setSelectedDoc(null);
        } catch (e: any) {
            console.error(e);
            alert(e?.response?.data?.message ?? "삭제 실패");
        } finally {
            setDocLoading(false);
        }
    };

    return (
        <div className="grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-black text-slate-900">
                            <Sparkles className="h-5 w-5 text-primary-600"/>
                            문서 Q&A
                        </h1>
                    </div>

                    <div
                        className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                        <FileText className="h-4 w-4"/>
                        Workspace #{workspaceId}
                    </div>
                </div>

                <Card>
                    <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                        <SlidersHorizontal className="h-4 w-4 text-slate-500"/>
                        검색 설정
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                            <div className="mb-1 text-xs font-bold text-slate-500">workspaceId</div>
                            <Input
                                value={workspaceId}
                                onChange={(e) => setWorkspaceId(Number(e.target.value))}
                                placeholder="workspaceId"
                            />
                        </div>

                        <div>
                            <div className="mb-1 text-xs font-bold text-slate-500">topK</div>
                            <Input value={topK} onChange={(e) => setTopK(Number(e.target.value))}
                                   placeholder="topK (기본 5)"/>
                        </div>
                    </div>
                </Card>

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
                            <div className="space-y-3">
                                {messages.map((m) => {
                                    const isUser = m.role === "user";
                                    return (
                                        <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                            <div className="max-w-[88%]">
                                                {!isUser && <div
                                                    className="mb-1 ml-2 text-[11px] font-extrabold text-slate-400">EVIDO
                                                    AI</div>}

                                                <div
                                                    className={[
                                                        "rounded-2xl px-4 py-3 text-sm shadow-sm",
                                                        isUser ? "bg-slate-900 text-white shadow-slate-200" : "bg-white text-slate-900 border border-slate-200",
                                                    ].join(" ")}
                                                >
                                                    <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                                                    {m.role === "assistant" && !m.loading && (
                                                        <div className="mt-3">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSources(m.id)}
                                                                    className={[
                                                                        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold transition",
                                                                        m.sourcesOpen
                                                                            ? "border-primary-200 bg-primary-50 text-primary-700"
                                                                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                                                                    ].join(" ")}
                                                                >
                                                                    {m.sourcesOpen ? "근거 닫기" : "근거 보기"}
                                                                </button>

                                                                <span
                                                                    className="text-[11px] text-slate-400">{m.evidences?.length ? `${m.evidences.length}개` : "0개"}</span>
                                                            </div>

                                                            {m.sourcesOpen && (
                                                                <div
                                                                    className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                                                    {m.evidences?.length ? (
                                                                        <ul className="space-y-2">
                                                                            {m.evidences.map((e, idx) => (
                                                                                <li key={idx}
                                                                                    className="rounded-xl bg-white p-3 border border-slate-200">
                                                                                    <div
                                                                                        className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-slate-700">
                                                                                        <span
                                                                                            className="rounded-md bg-slate-100 px-2 py-0.5">chunk #{e.chunkId ?? "?"}</span>
                                                                                        <span
                                                                                            className="text-slate-500">index {e.chunkIndex ?? "?"}</span>
                                                                                        <span
                                                                                            className="text-slate-500">
                                              score {typeof e.score === "number" ? e.score.toFixed(4) : "?"}
                                            </span>
                                                                                    </div>

                                                                                    <div
                                                                                        className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                                                                                        {e.contentHead ?? "(contentHead 없음)"}
                                                                                    </div>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    ) : (
                                                                        <div className="text-xs text-slate-500">근거 데이터가
                                                                            없습니다.</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-3 flex gap-2">
                        <div className="flex-1">
                            <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onEnterAsk}
                                   placeholder="질문을 입력하세요 (Enter 전송)"/>
                        </div>

                        <Button onClick={ask} disabled={!canAsk} className="min-w-[96px]">
              <span className="inline-flex items-center gap-2">
                <Send className="h-4 w-4"/>
                  {loading ? "생성 중..." : "전송"}
              </span>
                        </Button>
                    </div>

                    {!q.trim() && <div className="mt-2 text-xs text-slate-400">질문을 입력해야 전송 가능합니다.</div>}
                </Card>
            </div>

            <div className="lg:col-span-5 space-y-4">
                <Card>
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setDocListOpen((v) => !v)}
                            className="flex items-center gap-2 text-sm font-extrabold text-slate-800"
                        >
                            <FolderOpen className="h-4 w-4 text-slate-500"/>
                            문서 리스트
                            <span className="ml-1 text-xs text-slate-400">
        {docListOpen ? "▲" : "▼"}
      </span>
                        </button>

                        <button
                            type="button"
                            onClick={fetchDocs}
                            disabled={docLoading}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        >
                            <RefreshCw className={`h-4 w-4 ${docLoading ? "animate-spin" : ""}`}/>
                            새로고침
                        </button>
                    </div>

                    <div
                        className={`transition-all duration-300 overflow-hidden ${
                            docListOpen ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0"
                        }`}
                    >
                        <div
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <Search className="h-4 w-4 text-slate-400"/>
                            <input
                                value={docQuery}
                                onChange={(e) => {
                                    setDocQuery(e.target.value);
                                    setDocPageNo(0);
                                }}
                                placeholder="제목 / 파일명 검색"
                                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                            />
                        </div>

                        {docError && (
                            <div
                                className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                                {docError}
                            </div>
                        )}

                        <div className="mt-3 rounded-xl border border-slate-200 bg-white">
                            <div className="max-h-[340px] overflow-auto">
                                {docLoading ? (
                                    <div className="px-4 py-4 text-sm text-slate-500">불러오는 중...</div>
                                ) : docs.length === 0 ? (
                                    <div className="px-4 py-4 text-sm text-slate-500">
                                        등록된 문서가 없습니다.
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-slate-100">
                                        {docs.map((d) => {
                                            const active =
                                                selectedDoc?.documentId === d.documentId;
                                            const ext = getExt(d.filename);
                                            const badge =
                                                ext === "pdf"
                                                    ? "PDF"
                                                    : ext === "txt" || ext === "md"
                                                        ? "TEXT"
                                                        : ext
                                                            ? ext.toUpperCase()
                                                            : "FILE";

                                            return (
                                                <li key={d.documentId} className="px-3 py-3">
                                                    <div
                                                        className={`group rounded-xl px-3 py-2 transition cursor-pointer ${
                                                            active
                                                                ? "bg-primary-50 border border-primary-200"
                                                                : "hover:bg-slate-50"
                                                        }`}
                                                        onClick={() => setSelectedDoc(d)}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <div
                                                                    className="truncate text-sm font-bold text-slate-900">
                                                                    {d.title ?? `문서 #${d.documentId}`}
                                                                </div>
                                                                <div className="truncate text-xs text-slate-400">
                                                                    {d.filename ?? `doc #${d.documentId}`}
                                                                </div>
                                                            </div>

                                                            <span
                                                                className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{badge}
                                                            </span>
                                                        </div>

                                                        <div
                                                            className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition">
                                                            <a
                                                                href={`/api/documents/${d.documentId}/download`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                다운로드
                                                            </a>

                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDeleteDoc(d.documentId);
                                                                }}
                                                                disabled={docLoading}
                                                                className="text-xs font-semibold text-rose-500 hover:text-rose-700 disabled:opacity-60"
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {docPage && docPage.totalPages > 1 && (
                            <div className="mt-3 flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    {docPage.totalElements}개 · {docPage.number + 1}/
                                    {docPage.totalPages} 페이지
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDocPageNo((p) => Math.max(0, p - 1))}
                                        disabled={docLoading || docPageNo <= 0}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                                        이전
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDocPageNo((p) =>
                                                docPage
                                                    ? Math.min(docPage.totalPages - 1, p + 1)
                                                    : p + 1
                                            )
                                        }
                                        disabled={
                                            docLoading ||
                                            (docPage
                                                ? docPageNo >= docPage.totalPages - 1
                                                : false)
                                        }
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                    >
                                        다음
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                <Card>
                    <div className="text-sm font-extrabold text-slate-800">미리보기</div>

                    <div className="mt-3">
                        {!selectedDoc ? (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            </div>
                        ) : isPdf ? (
                            <PdfViewer
                                url={downloadUrl}
                                filename={selectedDoc.filename ?? undefined}
                                title={selectedDoc.title ?? "PDF 미리보기"}
                                height={680}
                            />
                        ) : isTextFile ? (
                            <TextViewer
                                url={textUrl}
                                filename={selectedDoc.filename ?? `doc-${selectedDoc.documentId}.txt`}
                                title={selectedDoc.title ?? `문서 #${selectedDoc.documentId}`}
                            />
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                현재는 <span className="font-black">PDF / TXT / MD</span>만 미리보기를 지원해요.
                                <div className="mt-2 text-xs text-slate-500">
                                    선택된 파일: {selectedDoc.filename ?? `doc #${selectedDoc.documentId}`}
                                </div>

                                <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                                >
                                    <Download className="h-4 w-4"/>
                                    다운로드로 열기
                                </a>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}