import { useEffect, useMemo, useRef, useState } from "react";
import Card from "../../components/common/Card";
import api from "../../api/client";
import {
    uploadDocumentsBulk,
    listDocuments,
    deleteDocument,
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
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(
            2,
            "0"
        )} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch {
        return iso;
    }
}


function makeFileUrl(d: DocumentListItem) {
    const anyD: any = d as any;
    const url = anyD.viewUrl || anyD.fileUrl || anyD.downloadUrl || anyD.url;
    if (typeof url === "string" && url.trim()) return url;

    return `/api/documents/${d.documentId}/file`;
}

async function fetchTextContent(documentId: number) {
    const res = await api.get<{ content: string }>(`/api/documents/${documentId}/content`);
    return res.data.content ?? "";
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
    const [textContent, setTextContent] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const totalPages = docPage?.totalPages ?? 0;

    const fetchDocs = async () => {
        try {
            setDocLoading(true);
            setDocError(null);
            const data = await listDocuments({
                query: query || undefined,
                page,
                size,
                sort: "createdAt,desc",
            });
            setDocPage(data);

            const stillExists =
                selected && data.content.some((x) => x.documentId === selected.documentId);
            if (selected && !stillExists) {
                setSelected(null);
                setViewerUrl(null);
                setViewerMode("unknown");
                setTextContent("");
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
    }, [page, workspaceId]);

    const onPick = async (d: DocumentListItem) => {
        setSelected(d);
        setTextError(null);
        setTextContent("");
        setTextLoading(false);

        const ext = getExt(d.filename);
        const mode = guessModeByExt(ext);
        setViewerMode(mode);

        const url = makeFileUrl(d);
        setViewerUrl(url);

        if (mode === "text") {
            try {
                setTextLoading(true);
                const c = await fetchTextContent(d.documentId);
                setTextContent(c);
            } catch (e: any) {
                console.error(e);
                setTextError(e?.response?.data?.message ?? "텍스트 미리보기 실패");
            } finally {
                setTextLoading(false);
            }
        }
    };

    const onDelete = async (d: DocumentListItem) => {
        if (!confirm(`문서를 삭제하시겠습니까?\n${d.title ?? `문서 #${d.documentId}`}`)) return;

        try {
            setDocLoading(true);
            await deleteDocument(d.documentId);
            await fetchDocs();
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
        if (!files.length) return;

        try {
            setUploadLoading(true);
            setUploadProgress(0);

            const data = await uploadDocumentsBulk({
                title: undefined,
                files,
                onProgress: (p) => setUploadProgress(p),
            });

            const ok = data.success?.length ?? 0;
            const fail = data.failed?.length ?? 0;
            alert(`업로드 완료! 성공 ${ok} / 실패 ${fail}`);
            setPage(0);
            await fetchDocs();
        } catch (e: any) {
            console.error(e);
            alert(e?.response?.data?.message ?? "업로드 실패");
        } finally {
            setUploadLoading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const list = docPage?.content ?? [];

    const selectedTitle = useMemo(() => {
        if (!selected) return "파일을 선택하세요";
        return selected.title ?? `문서 #${selected.documentId}`;
    }, [selected]);

    return (
        <div className="space-y-4">
            <Card>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                        <FolderOpen className="h-4 w-4 text-slate-500" />
                        파일
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={fetchDocs}
                            disabled={docLoading || uploadLoading}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        >
                            <RefreshCw className={`h-4 w-4 ${docLoading ? "animate-spin" : ""}`} />
                            새로고침
                        </button>

                        <button
                            type="button"
                            onClick={onUploadClick}
                            disabled={uploadLoading}
                            className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-black text-primary-700 hover:bg-primary-100 disabled:opacity-60"
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

                {(uploadLoading || uploadProgress > 0) && (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between text-xs">
                            <div className="font-bold text-slate-700">업로드 진행률</div>
                            <div className="font-black text-primary-700">{uploadProgress}%</div>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    </div>
                )}

                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(0);
                        }}
                        placeholder="문서 검색(제목/파일명)"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                </div>

                {docError && (
                    <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                        {docError}
                    </div>
                )}

                <div className="mt-3 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black text-slate-600">
                        <div className="col-span-7">문서</div>
                        <div className="col-span-3">등록일</div>
                        <div className="col-span-2 text-right">삭제</div>
                    </div>

                    {docLoading ? (
                        <div className="px-4 py-4 text-sm text-slate-500">불러오는 중...</div>
                    ) : list.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-slate-500">등록된 문서가 없습니다.</div>
                    ) : (
                        <ul className="divide-y divide-slate-200">
                            {list.map((d) => {
                                const active = selected?.documentId === d.documentId;
                                return (
                                    <li key={d.documentId} className="grid grid-cols-12 items-center gap-2 px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => onPick(d)}
                                            className={[
                                                "col-span-7 min-w-0 text-left rounded-2xl border px-3 py-2 transition",
                                                active
                                                    ? "border-primary-300 bg-primary-50"
                                                    : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-slate-400" />
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-bold text-slate-900">
                                                        {d.title ?? `문서 #${d.documentId}`}
                                                    </div>
                                                    <div className="mt-0.5 truncate text-[11px] text-slate-500">
                                                        {d.filename ? d.filename : `doc #${d.documentId}`}
                                                        {typeof d.latestVersionId === "number" ? ` · ver #${d.latestVersionId}` : ""}
                                                        {d.status ? ` · ${d.status}` : ""}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>

                                        <div className="col-span-3 text-xs text-slate-600">{formatDate(d.createdAt)}</div>

                                        <div className="col-span-2 text-right">
                                            <button
                                                type="button"
                                                onClick={() => onDelete(d)}
                                                disabled={docLoading}
                                                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                삭제
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {docPage && totalPages > 1 && (
                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            {docPage.totalElements}개 · {docPage.number + 1}/{docPage.totalPages} 페이지
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={docLoading || page <= 0}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                                이전
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min((docPage?.totalPages ?? 1) - 1, p + 1))}
                                disabled={docLoading || page >= (docPage?.totalPages ?? 1) - 1}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                                다음
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            <Card>
                <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-extrabold text-slate-800">뷰어</div>
                    {viewerUrl && (
                        <a
                            href={viewerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                            <ExternalLink className="h-4 w-4" />
                            새 탭에서 열기
                        </a>
                    )}
                </div>

                <div className="mt-3">
                    {!selected && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            왼쪽 파일 리스트에서 문서를 선택하면 여기에서 미리보기가 표시됩니다.
                        </div>
                    )}

                    {selected && (
                        <div className="space-y-3">
                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                <div className="text-xs font-extrabold text-slate-500">선택된 문서</div>
                                <div className="mt-1 text-sm font-black text-slate-900">{selectedTitle}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                    {selected.filename ? `파일: ${selected.filename}` : `doc #${selected.documentId}`}
                                </div>
                            </div>

                            {viewerMode === "pdf" && viewerUrl && (
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                    <iframe title="pdf-viewer" src={viewerUrl} className="h-[560px] w-full" />
                                </div>
                            )}

                            {viewerMode === "text" && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    {textLoading ? (
                                        <div className="text-sm text-slate-600">불러오는 중...</div>
                                    ) : textError ? (
                                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                                            {textError}
                                        </div>
                                    ) : (
                                        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{textContent}</pre>
                                    )}
                                </div>
                            )}

                            {viewerMode === "unknown" && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                    이 파일 형식은 브라우저 미리보기가 제한될 수 있어요. “새 탭에서 열기”로 확인하세요.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}