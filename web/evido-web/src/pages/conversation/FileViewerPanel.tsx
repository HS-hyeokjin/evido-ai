import { useCallback, useEffect, useRef, useState } from "react";
import {
    uploadDocumentsBulk,
    listDocuments,
    deleteDocument,
    getDocumentFileUrl,
    getDocumentTextContent,
    type DocumentListItem,
    type PageResponse,
} from "../../api/documents";
import {
    FileText,
    UploadCloud,
    RefreshCw,
    Trash2,
    ExternalLink,
    Search,
    FolderOpen,
    ChevronDown,
    ChevronRight,
} from "lucide-react";

type Props = {
    workspaceId: number;
};

type ViewerMode = "pdf" | "text" | "unknown";

function getExt(name?: string | null) {
    if (!name) return "";
    const lower = name.toLowerCase();
    const dot = lower.lastIndexOf(".");
    return dot >= 0 ? lower.slice(dot) : "";
}

function guessModeByExt(ext: string): ViewerMode {
    if (ext === ".pdf") return "pdf";
    if (ext === ".txt" || ext === ".md") return "text";
    return "unknown";
}

function formatDate(iso?: string | null) {
    if (!iso) return "-";
    try {
        const d = new Date(iso);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
        ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
            d.getMinutes()
        ).padStart(2, "0")}`;
    } catch {
        return iso;
    }
}

export default function FileViewerPanel({ workspaceId }: Props) {
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(0);
    const size = 10;

    const [docLoading, setDocLoading] = useState(false);
    const [docError, setDocError] = useState<string | null>(null);
    const [docPage, setDocPage] = useState<PageResponse<DocumentListItem> | null>(null);

    const [selected, setSelected] = useState<DocumentListItem | null>(null);
    const [viewerMode, setViewerMode] = useState<ViewerMode>("unknown");
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);

    const [textLoading, setTextLoading] = useState(false);
    const [textError, setTextError] = useState<string | null>(null);
    const [textContent, setTextContent] = useState("");

    const [fileSectionOpen, setFileSectionOpen] = useState(true);
    const [viewerSectionOpen, setViewerSectionOpen] = useState(true);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const totalPages = docPage?.totalPages ?? 0;
    const list = docPage?.content ?? [];

    const hasValidWorkspace =
        Number.isFinite(workspaceId) && workspaceId > 0;

    const resetViewer = () => {
        setSelected(null);
        setViewerUrl(null);
        setViewerMode("unknown");
        setTextContent("");
        setTextError(null);
        setTextLoading(false);
    };

    const fetchDocs = useCallback(
        async (currentQuery = query, currentPage = page) => {
            if (!hasValidWorkspace) {
                setDocPage(null);
                setDocError("워크스페이스 정보가 없습니다.");
                resetViewer();
                return;
            }

            try {
                setDocLoading(true);
                setDocError(null);

                const data = await listDocuments(workspaceId, {
                    query: currentQuery || undefined,
                    page: currentPage,
                    size,
                    sort: "createdAt,desc",
                });

                setDocPage(data);

                const stillExists =
                    selected &&
                    data.content.some((x) => x.documentId === selected.documentId);

                if (selected && !stillExists) {
                    resetViewer();
                }
            } catch (e: any) {
                console.error(e);
                setDocError(e?.response?.data?.message ?? "문서 목록 조회 실패");
            } finally {
                setDocLoading(false);
            }
        },
        [hasValidWorkspace, workspaceId, query, page, size, selected]
    );

    useEffect(() => {
        setPage(0);
        resetViewer();
    }, [workspaceId]);

    useEffect(() => {
        fetchDocs(query, page);
    }, [fetchDocs, query, page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            fetchDocs(query, 0);
        }, 250);

        return () => clearTimeout(timer);
    }, [query, fetchDocs]);

    const onPick = async (d: DocumentListItem) => {
        if (!hasValidWorkspace) {
            alert("워크스페이스 정보가 없습니다.");
            return;
        }

        setSelected(d);
        setTextError(null);
        setTextContent("");
        setTextLoading(false);

        const ext = getExt(d.filename);
        const mode = guessModeByExt(ext);
        setViewerMode(mode);

        const url = getDocumentFileUrl(
            workspaceId,
            d.documentId,
            typeof d.latestVersionId === "number" ? d.latestVersionId : undefined
        );
        setViewerUrl(url);

        if (mode === "text") {
            try {
                setTextLoading(true);

                const content = await getDocumentTextContent(
                    workspaceId,
                    d.documentId,
                    typeof d.latestVersionId === "number" ? d.latestVersionId : undefined
                );

                setTextContent(content);
            } catch (e: any) {
                console.error(e);
                setTextError(e?.response?.data?.message ?? "텍스트 미리보기 실패");
            } finally {
                setTextLoading(false);
            }
        }
    };

    const onDelete = async (d: DocumentListItem) => {
        if (!hasValidWorkspace) {
            alert("워크스페이스 정보가 없습니다.");
            return;
        }

        if (!confirm(`문서를 삭제하시겠습니까?\n${d.title ?? `문서 #${d.documentId}`}`)) {
            return;
        }

        try {
            setDocLoading(true);
            await deleteDocument(workspaceId, d.documentId);
            await fetchDocs(query, page);
        } catch (e: any) {
            console.error(e);
            alert(e?.response?.data?.message ?? "삭제 실패");
        } finally {
            setDocLoading(false);
        }
    };

    const onUploadClick = () => {
        if (uploadLoading) return;
        fileInputRef.current?.click();
    };

    const onUploadFiles = async (files: File[]) => {
        if (!hasValidWorkspace) {
            alert("워크스페이스 정보가 없습니다.");
            return;
        }

        if (!files.length) return;

        try {
            setUploadLoading(true);
            setUploadProgress(0);

            const data = await uploadDocumentsBulk(workspaceId, {
                files,
                onProgress: (p) => setUploadProgress(p),
            });

            const ok = data.success?.length ?? 0;
            const fail = data.failed?.length ?? 0;

            alert(`업로드 완료! 성공 ${ok} / 실패 ${fail}`);
            setPage(0);
            await fetchDocs(query, 0);
        } catch (e: any) {
            console.error(e);
            alert(e?.response?.data?.message ?? "업로드 실패");
        } finally {
            setUploadLoading(false);
            setUploadProgress(0);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (!hasValidWorkspace) {
        return (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                워크스페이스 정보가 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <div className="border-b border-slate-100 px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <button
                                type="button"
                                onClick={() => setFileSectionOpen((prev) => !prev)}
                                className="mt-3 inline-flex items-center gap-2 rounded-xl text-left text-base font-black text-slate-900 transition hover:text-primary-700"
                            >
                                {fileSectionOpen ? (
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-500" />
                                )}
                                <FolderOpen className="h-4 w-4 text-slate-500" />
                                파일
                            </button>

                            <div className="mt-2 text-xs font-bold text-primary-700">
                                workspace #{workspaceId}
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={() => fetchDocs(query, page)}
                                disabled={docLoading || uploadLoading}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${docLoading ? "animate-spin" : ""}`}
                                />
                                새로고침
                            </button>

                            <button
                                type="button"
                                onClick={onUploadClick}
                                disabled={uploadLoading}
                                className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3.5 py-2 text-xs font-black text-primary-700 transition hover:bg-primary-100 disabled:opacity-60"
                            >
                                <UploadCloud className="h-4 w-4" />
                                업로드
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.docx,.txt,.md"
                                className="hidden"
                                onChange={(e) => onUploadFiles(Array.from(e.target.files ?? []))}
                            />
                        </div>
                    </div>
                </div>

                {fileSectionOpen && (
                    <div className="space-y-4 p-5">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="문서명 검색"
                                className="w-full rounded-[20px] border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-primary-300 focus:bg-white"
                            />
                        </div>

                        {(uploadLoading || uploadProgress > 0) && (
                            <div className="rounded-[24px] border border-primary-100 bg-gradient-to-r from-primary-50 to-white p-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-700">업로드 진행률</span>
                                    <span className="font-black text-primary-700">
                                        {uploadProgress}%
                                    </span>
                                </div>

                                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-primary-500 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {docError && (
                            <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                                {docError}
                            </div>
                        )}

                        <div className="space-y-3">
                            {docLoading ? (
                                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                    문서를 불러오는 중...
                                </div>
                            ) : list.length === 0 ? (
                                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                                        <FileText className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="text-sm font-semibold text-slate-700">
                                        등록된 문서가 없습니다
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">
                                        PDF, TXT, MD 문서를 업로드해서 시작해보세요.
                                    </div>
                                </div>
                            ) : (
                                list.map((d) => {
                                    const active = selected?.documentId === d.documentId;

                                    return (
                                        <div
                                            key={d.documentId}
                                            className={[
                                                "rounded-[26px] border p-4 transition-all",
                                                active
                                                    ? "border-primary-200 bg-primary-50/70 shadow-[0_12px_30px_rgba(109,40,217,0.08)]"
                                                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-start gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => onPick(d)}
                                                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                                                >
                                                    <div
                                                        className={[
                                                            "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1",
                                                            active
                                                                ? "bg-white text-primary-700 ring-primary-200"
                                                                : "bg-slate-50 text-slate-500 ring-slate-200",
                                                        ].join(" ")}
                                                    >
                                                        <FileText className="h-5 w-5" />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="truncate text-sm font-bold text-slate-900">
                                                            {d.title ?? `문서 #${d.documentId}`}
                                                        </div>

                                                        <div className="mt-1 truncate text-xs text-slate-500">
                                                            {d.filename ? d.filename : `doc #${d.documentId}`}
                                                        </div>

                                                        <div className="mt-1 text-[11px] text-slate-400">
                                                            {formatDate(d.createdAt)}
                                                        </div>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(d)}
                                                    disabled={docLoading}
                                                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {docPage && totalPages > 1 && (
                            <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-3">
                                <div className="text-xs text-slate-500">
                                    {docPage.totalElements}개 · {docPage.number + 1}/{docPage.totalPages} 페이지
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        disabled={docLoading || page <= 0}
                                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                                    >
                                        이전
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min((docPage?.totalPages ?? 1) - 1, p + 1)
                                            )
                                        }
                                        disabled={
                                            docLoading ||
                                            page >= (docPage?.totalPages ?? 1) - 1
                                        }
                                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                                    >
                                        다음
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <section className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <div className="border-b border-slate-100 px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <button
                                type="button"
                                onClick={() => setViewerSectionOpen((prev) => !prev)}
                                className="inline-flex items-center gap-2 text-left text-base font-black text-slate-900 transition hover:text-primary-700"
                            >
                                {viewerSectionOpen ? (
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-500" />
                                )}
                                미리보기
                            </button>
                        </div>

                        {viewerUrl && (
                            <a
                                href={viewerUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                                <ExternalLink className="h-4 w-4" />
                                새 탭에서 열기
                            </a>
                        )}
                    </div>
                </div>

                {viewerSectionOpen && (
                    <div className="p-5">
                        {!selected && (
                            <div className="rounded-[26px] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-12 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                                    <FileText className="h-6 w-6 text-slate-400" />
                                </div>

                                <div className="text-sm font-semibold text-slate-700">
                                    문서를 선택하면 미리보기가 표시됩니다
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                    왼쪽 목록에서 문서를 눌러보세요.
                                </div>
                            </div>
                        )}

                        {selected && (
                            <div className="space-y-4">
                                <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                                    <div className="text-sm font-bold text-slate-900">
                                        {selected.title ?? `문서 #${selected.documentId}`}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">
                                        {selected.filename || `doc #${selected.documentId}`}
                                    </div>
                                </div>

                                {viewerMode === "pdf" && viewerUrl && (
                                    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
                                        <iframe
                                            title="pdf-viewer"
                                            src={viewerUrl}
                                            className="h-[620px] w-full"
                                        />
                                    </div>
                                )}

                                {viewerMode === "text" && (
                                    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
                                        {textLoading ? (
                                            <div className="px-5 py-8 text-sm text-slate-500">
                                                텍스트를 불러오는 중...
                                            </div>
                                        ) : textError ? (
                                            <div className="p-4">
                                                <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                                                    {textError}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="max-h-[620px] overflow-auto px-5 py-4">
                                                <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
                                                    {textContent}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {viewerMode === "unknown" && (
                                    <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 px-5 py-6 text-sm leading-6 text-slate-600">
                                        이 파일 형식은 브라우저 미리보기가 제한될 수 있어요.
                                        <br />
                                        상단의 <span className="font-semibold">새 탭에서 열기</span>로 확인해보세요.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}