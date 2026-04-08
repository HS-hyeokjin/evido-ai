import { useEffect, useMemo, useRef, useState } from "react";
import {
    uploadDocumentsBulk,
    listDocuments,
    deleteDocument,
    type BulkUploadResponse,
    type DocumentListItem,
    type PageResponse
} from "../../api/documents";
import {
    UploadCloud,
    FolderOpen,
    RefreshCw,
    Trash2,
    CheckCircle2,
    XCircle,
    FileText,
    AlertTriangle,
    HardDrive,
    Sparkles,
    ChevronRight
} from "lucide-react";

const ACCEPTED_EXTS = [".pdf", ".docx", ".txt", ".md"] as const;
const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIMES = new Set<string>([
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

type RejectedItem = {
    name: string;
    reason: string;
    size: number;
};

function getExt(name: string) {
    const lower = name.toLowerCase();
    const dot = lower.lastIndexOf(".");
    return dot >= 0 ? lower.slice(dot) : "";
}

function prettySize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.ceil(kb)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
}

function validateFile(file: File): { ok: true } | { ok: false; reason: string } {
    const ext = getExt(file.name);

    if (!ACCEPTED_EXTS.includes(ext as any)) {
        return { ok: false, reason: `허용되지 않은 확장자(${ext || "없음"})` };
    }

    if (file.size > MAX_BYTES) {
        return { ok: false, reason: `용량 초과(${prettySize(file.size)} > ${prettySize(MAX_BYTES)})` };
    }

    if (file.type && !ALLOWED_MIMES.has(file.type)) {
        return { ok: false, reason: `허용되지 않은 파일(${file.type})` };
    }

    return { ok: true };
}

async function getFilesFromDropEvent(e: React.DragEvent): Promise<File[]> {
    const items = Array.from(e.dataTransfer.items ?? []);
    const hasEntries = items.some((it: any) => typeof (it as any).webkitGetAsEntry === "function");

    if (hasEntries) {
        const files: File[] = [];
        for (const item of items) {
            const anyItem = item as any;
            const entry = anyItem.webkitGetAsEntry?.();
            if (!entry) continue;
            const got = await traverseEntry(entry);
            files.push(...got);
        }
        return files;
    }

    return Array.from(e.dataTransfer.files ?? []);
}

function readAllEntries(reader: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
        reader.readEntries(resolve, reject);
    });
}

async function traverseEntry(entry: any): Promise<File[]> {
    if (entry.isFile) {
        return new Promise((resolve) => {
            entry.file((file: File) => resolve([file]), () => resolve([]));
        });
    }

    if (entry.isDirectory) {
        const reader = entry.createReader();
        const files: File[] = [];
        while (true) {
            const entries = await readAllEntries(reader);
            if (!entries.length) break;
            for (const child of entries) {
                const got = await traverseEntry(child);
                files.push(...got);
            }
        }
        return files;
    }

    return [];
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

export default function DocumentsUploadPage() {
    const [title] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [rejected, setRejected] = useState<RejectedItem[]>([]);
    const [result, setResult] = useState<BulkUploadResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState<number>(0);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const acceptedHint = "PDF / DOCX / TXT / MD";
    const maxHint = prettySize(MAX_BYTES);

    const summaryLabel = useMemo(() => {
        if (files.length === 0) return `파일/폴더를 드래그하거나 클릭해서 선택하세요`;
        const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
        return `${files.length}개 선택됨 · 총 ${prettySize(totalBytes)}`;
    }, [files]);

    const addFiles = (incoming: File[]) => {
        if (incoming.length === 0) return;

        const next = [...files];
        const rejectedItems: RejectedItem[] = [];

        for (const f of incoming) {
            const v = validateFile(f);
            if (!v.ok) {
                rejectedItems.push({ name: f.name, reason: v.reason, size: f.size });
                continue;
            }

            const dup = next.some((x) => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified);
            if (!dup) next.push(f);
        }

        if (rejectedItems.length > 0) {
            setRejected((prev) => [...rejectedItems, ...prev].slice(0, 50));
            console.warn("Rejected files:", rejectedItems);
        }

        setFiles(next);
        setResult(null);
    };

    const onBrowseClick = () => {
        if (loading) return;
        fileInputRef.current?.click();
    };

    const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (loading) return;

        const dropped = await getFilesFromDropEvent(e);
        if (dropped.length === 0) {
            alert("드롭된 파일이 없습니다.");
            return;
        }

        addFiles(dropped);

        const droppedExts = dropped.map((f) => getExt(f.name)).filter(Boolean);
        const hasAnyAccepted = droppedExts.some((ext) => ACCEPTED_EXTS.includes(ext as any));
        if (!hasAnyAccepted) {
            alert(`허용 파일(${acceptedHint})이 없습니다. 폴더를 드롭했다면 확장자를 확인해주세요.`);
            return;
        }
    };

    const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (loading) return;
        if (!isDragging) setIsDragging(true);
    };

    const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const removeFile = (idx: number) => {
        const next = files.slice();
        next.splice(idx, 1);
        setFiles(next);
        setResult(null);
    };

    const clearAll = () => {
        setFiles([]);
        setRejected([]);
        setResult(null);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const [docLoading, setDocLoading] = useState(false);
    const [docError, setDocError] = useState<string | null>(null);
    const [docPage, setDocPage] = useState<PageResponse<DocumentListItem> | null>(null);

    const [q] = useState("");
    const [page, setPage] = useState(0);
    const size = 10;

    const fetchDocs = async () => {
        try {
            setDocLoading(true);
            setDocError(null);
            const data = await listDocuments({ query: q || undefined, page, size, sort: "createdAt,desc" });
            setDocPage(data);
        } catch (e: any) {
            console.error(e);
            setDocError(e?.response?.data?.message ?? "문서 목록 조회 실패");
        } finally {
            setDocLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, [page]);

    useEffect(() => {
        if (!result) return;
        fetchDocs();
    }, [result]);

    const onUpload = async () => {
        if (files.length === 0) return alert("파일을 선택해주세요.");
        try {
            setLoading(true);
            setProgress(0);

            const data = await uploadDocumentsBulk({
                title: title || undefined,
                files,
                onProgress: (p) => setProgress(p),
            });

            setResult(data);
            const ok = data.success?.length ?? 0;
            const fail = data.failed?.length ?? 0;
            alert(`업로드 완료! 성공 ${ok} / 실패 ${fail}`);
        } catch (e: any) {
            console.error(e);
            alert(e?.response?.data?.message ?? "업로드 실패");
        } finally {
            setLoading(false);
        }
    };

    const onDeleteDoc = async (documentId: number) => {
        if (!confirm("문서를 삭제하시겠습니까?")) return;

        try {
            setDocLoading(true);
            await deleteDocument(documentId);
            await fetchDocs();
        } catch (e: any) {
            console.error(e);
            alert(e?.response?.data?.message ?? "삭제 실패");
        } finally {
            setDocLoading(false);
        }
    };

    const totalSelectedBytes = useMemo(() => files.reduce((acc, f) => acc + f.size, 0), [files]);

    return (
        <div className="max-w-5xl space-y-6 font-sans text-slate-800">
            <div className="relative overflow-hidden rounded-[22px] border border-[#EEE7FB] bg-gradient-to-br from-white via-[#FCFAFF] to-[#F7F2FF] p-5 shadow-[0_8px_24px_rgba(124,106,166,0.06)]">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#EDE2FF]/60 blur-3xl" />
                <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-[#F3ECFF] blur-3xl" />

                <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E9DFFB] bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#8A72B8]">
                            <Sparkles size={12} />
                            Document Upload
                        </div>

                        <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                            문서 업로드
                        </h1>

                        <p className="mt-1.5 text-xs leading-5 text-[#7B728D]">
                            파일을 업로드하고 문서 목록을 관리할 수 있어요.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl border border-[#E9DFFB] bg-white/80 px-3 py-2 text-xs font-semibold text-[#7C63B8]">
                        <HardDrive className="h-4 w-4" />
                        최대 {maxHint}
                    </div>
                </div>

                <div className="relative mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#EEE7FB] bg-white/75 px-3.5 py-3 backdrop-blur">
                        <div className="text-[11px] font-semibold text-[#9A8CB8]">허용 형식</div>
                        <div className="mt-1 text-sm font-black text-slate-900">{acceptedHint}</div>
                    </div>
                    <div className="rounded-xl border border-[#EEE7FB] bg-white/75 px-3.5 py-3 backdrop-blur">
                        <div className="text-[11px] font-semibold text-[#9A8CB8]">선택 파일</div>
                        <div className="mt-1 text-sm font-black text-slate-900">{files.length}개</div>
                    </div>
                    <div className="rounded-xl border border-[#EEE7FB] bg-white/75 px-3.5 py-3 backdrop-blur">
                        <div className="text-[11px] font-semibold text-[#9A8CB8]">총 용량</div>
                        <div className="mt-1 text-sm font-black text-slate-900">{prettySize(totalSelectedBytes)}</div>
                    </div>
                </div>
            </div>

            <section className="rounded-[22px] border border-[#F0E9FC] bg-white p-5 shadow-[0_8px_24px_rgba(100,90,140,0.04)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-black text-slate-900">파일/폴더 업로드</div>
                        <div className="text-xs text-[#8B84A0]">
                            드래그 앤 드롭 또는 클릭해서 추가할 수 있어요
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={clearAll}
                        disabled={loading || (files.length === 0 && rejected.length === 0)}
                        className="rounded-xl border border-[#E9DFFB] bg-[#FCFAFF] px-3 py-2 text-xs font-bold text-[#7C63B8] transition hover:bg-[#F7F1FF] disabled:opacity-50"
                    >
                        전체 초기화
                    </button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.md"
                    onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
                    className="hidden"
                />

                <div
                    role="button"
                    tabIndex={0}
                    onClick={onBrowseClick}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") onBrowseClick();
                    }}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    className={[
                        "rounded-3xl border-2 border-dashed p-5 transition",
                        "bg-gradient-to-b from-[#FFFEFF] to-[#F9F5FF]",
                        loading ? "cursor-not-allowed border-[#EEE7FB] opacity-70" : "",
                        !loading && isDragging ? "border-[#BFA8F8] ring-4 ring-[#F1EAFE]" : "",
                        !loading && !isDragging ? "border-[#E9DFFB] hover:border-[#DCCBFA]" : "",
                    ].join(" ")}
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F4EEFF] text-[#8A72B8]">
                                    <UploadCloud className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                    <div className="truncate text-sm font-black text-slate-900">
                                        {summaryLabel}
                                    </div>
                                    <div className="mt-1 text-xs text-[#8B84A0]">
                                        허용: {acceptedHint} · 최대 {maxHint}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#F4EEFF] px-4 py-2 text-xs font-black text-[#7C63B8]">
                            <FolderOpen className="h-4 w-4" />
                            파일 추가
                        </span>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-[#EEE7FB] bg-white px-3 py-3">
                                <div className="text-[11px] font-extrabold text-[#9A8CB8]">선택 파일</div>
                                <div className="text-sm font-black text-slate-900">{files.length}개</div>
                            </div>
                            <div className="rounded-2xl border border-[#EEE7FB] bg-white px-3 py-3">
                                <div className="text-[11px] font-extrabold text-[#9A8CB8]">총 용량</div>
                                <div className="text-sm font-black text-slate-900">{prettySize(totalSelectedBytes)}</div>
                            </div>
                            <div className="rounded-2xl border border-[#EEE7FB] bg-white px-3 py-3">
                                <div className="text-[11px] font-extrabold text-[#9A8CB8]">기본 topK</div>
                                <div className="text-sm font-black text-slate-900">5</div>
                            </div>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="mt-4 rounded-3xl border border-[#EEE7FB] bg-white p-4">
                        <div className="flex items-center justify-between text-xs">
                            <div className="font-black text-slate-700">업로드 진행률</div>
                            <div className="font-black text-[#7C63B8]">{progress}%</div>
                        </div>

                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#F1EAFE]">
                            <div
                                className="h-full rounded-full bg-[#BFA8F8] transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="mt-2 text-[11px] text-[#9A93AD]">
                            처리량에 따라 진행률이 일정하지 않을 수 있어요.
                        </div>
                    </div>
                )}

                {files.length > 0 && (
                    <div className="mt-4 overflow-hidden rounded-3xl border border-[#EEE7FB] bg-white">
                        <div className="flex items-center justify-between border-b border-[#EEE7FB] bg-[#FCFAFF] px-4 py-3">
                            <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                                <FileText className="h-4 w-4 text-[#8A72B8]" />
                                선택된 파일
                            </div>

                            <button
                                type="button"
                                onClick={clearAll}
                                disabled={loading}
                                className="rounded-xl border border-[#E9DFFB] bg-white px-3 py-2 text-xs font-bold text-[#7C63B8] transition hover:bg-[#F7F1FF] disabled:opacity-50"
                            >
                                전체 제거
                            </button>
                        </div>

                        <ul className="divide-y divide-[#F1EAFB]">
                            {files.map((f, idx) => (
                                <li
                                    key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
                                    className="flex items-center justify-between gap-3 px-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-bold text-slate-900">{f.name}</div>
                                        <div className="mt-1 text-xs text-[#8B84A0]">
                                            {prettySize(f.size)} · {f.type || "mime:unknown"}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeFile(idx)}
                                        disabled={loading}
                                        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#E9DFFB] bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-[#FCFAFF] disabled:opacity-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        제거
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {rejected.length > 0 && (
                    <div className="mt-4 rounded-3xl border border-amber-200 bg-[#FFF8EB] p-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm font-black text-amber-900">
                                <AlertTriangle className="h-4 w-4" />
                                제외된 파일
                            </div>

                            <button
                                type="button"
                                onClick={() => setRejected([])}
                                disabled={loading}
                                className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100 disabled:opacity-50"
                            >
                                목록 비우기
                            </button>
                        </div>

                        <div className="mt-1 text-xs text-amber-800">
                            허용: {acceptedHint} · 최대 {maxHint}
                        </div>

                        <ul className="mt-3 space-y-2">
                            {rejected.slice(0, 10).map((r, idx) => (
                                <li key={`${r.name}-${idx}`} className="rounded-2xl border border-amber-200 bg-white p-3">
                                    <div className="truncate text-sm font-bold text-slate-900">{r.name}</div>
                                    <div className="mt-1 text-xs text-slate-600">{prettySize(r.size)}</div>
                                    <div className="mt-1 text-xs font-bold text-amber-700">{r.reason}</div>
                                </li>
                            ))}
                        </ul>

                        {rejected.length > 10 && (
                            <div className="mt-2 text-xs text-amber-800">
                                * {rejected.length}개 중 10개만 표시 중
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={onUpload}
                    disabled={loading || files.length === 0}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#BFA8F8] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_18px_rgba(191,168,248,0.28)] transition hover:-translate-y-0.5 hover:bg-[#B397F4] disabled:cursor-not-allowed disabled:bg-[#E5DBFA] disabled:shadow-none"
                >
                    <UploadCloud className="h-4 w-4" />
                    {loading ? "업로드 중..." : `업로드 (${files.length}개)`}
                </button>
            </section>

            {result && (
                <div className="grid gap-4 md:grid-cols-2">
                    <section className="rounded-[22px] border border-[#F0E9FC] bg-white p-5 shadow-[0_8px_24px_rgba(100,90,140,0.04)]">
                        <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            성공
                        </div>

                        {result.success.length === 0 ? (
                            <div className="text-sm text-[#8B84A0]">성공한 항목이 없습니다.</div>
                        ) : (
                            <ul className="space-y-2">
                                {result.success.map((r) => (
                                    <li
                                        key={`${r.documentId}-${r.versionId}-${r.fileId}`}
                                        className="rounded-2xl border border-[#EEE7FB] bg-[#FCFAFF] p-3"
                                    >
                                        <div className="font-extrabold text-slate-900">{r.title}</div>
                                        <div className="mt-1 text-xs text-[#8B84A0]">
                                            doc #{r.documentId} · ver #{r.versionId}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="rounded-[22px] border border-[#F0E9FC] bg-white p-5 shadow-[0_8px_24px_rgba(100,90,140,0.04)]">
                        <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                            <XCircle className="h-5 w-5 text-rose-600" />
                            실패
                        </div>

                        {result.failed.length === 0 ? (
                            <div className="text-sm text-[#8B84A0]">실패한 항목이 없습니다.</div>
                        ) : (
                            <ul className="space-y-2">
                                {result.failed.map((f, idx) => (
                                    <li key={`${f.filename}-${idx}`} className="rounded-2xl border border-[#F4D5D9] bg-white p-3">
                                        <div className="font-extrabold text-slate-900">{f.filename}</div>
                                        <div className="mt-1 text-xs font-bold text-rose-600">{f.reason}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}

            <section className="rounded-[22px] border border-[#F0E9FC] bg-white p-5 shadow-[0_8px_24px_rgba(100,90,140,0.04)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <div className="text-base font-black text-slate-900">등록된 문서</div>
                        <div className="text-xs text-[#8B84A0]">
                            업로드된 문서를 최신순으로 확인할 수 있어요
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={fetchDocs}
                        disabled={docLoading}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#E9DFFB] bg-[#FCFAFF] px-3 py-2 text-xs font-bold text-[#7C63B8] transition hover:bg-[#F7F1FF] disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${docLoading ? "animate-spin" : ""}`} />
                        새로고침
                    </button>
                </div>

                {docError && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                        {docError}
                    </div>
                )}

                {docLoading && <div className="text-sm text-[#8B84A0]">목록 불러오는 중...</div>}

                {!docLoading && docPage && docPage.content.length === 0 && (
                    <div className="flex h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E9DFFB] bg-gradient-to-b from-[#FFFEFF] to-[#F9F5FF] text-center">
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4EEFF] text-[#8A72B8]">
                            <FileText size={18} />
                        </div>
                        <div className="text-sm font-semibold text-slate-700">등록된 문서가 없습니다</div>
                        <div className="mt-1 text-xs text-[#9A93AD]">문서를 업로드하면 여기에 표시돼요</div>
                    </div>
                )}

                {!docLoading && docPage && docPage.content.length > 0 && (
                    <div className="overflow-hidden rounded-3xl border border-[#EEE7FB] bg-white">
                        <div className="grid grid-cols-12 border-b border-[#EEE7FB] bg-[#FCFAFF] px-4 py-3 text-xs font-black text-[#8B84A0]">
                            <div className="col-span-5">제목</div>
                            <div className="col-span-2">상태</div>
                            <div className="col-span-4">등록일</div>
                            <div className="col-span-1 text-right">삭제</div>
                        </div>

                        <ul className="divide-y divide-[#F1EAFB]">
                            {docPage.content.map((d) => (
                                <li key={d.documentId} className="grid grid-cols-12 items-center gap-2 px-4 py-3">
                                    <div className="col-span-5 min-w-0">
                                        <div className="truncate text-sm font-bold text-slate-900">
                                            {d.title ?? `문서 #${d.documentId}`}
                                        </div>
                                        <div className="mt-1 truncate text-xs text-[#8B84A0]">
                                            doc #{d.documentId}
                                            {typeof d.latestVersionId === "number" ? ` · ver #${d.latestVersionId}` : ""}
                                            {d.filename ? ` · ${d.filename}` : ""}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <span className="inline-flex rounded-xl border border-[#EEE7FB] bg-[#FCFAFF] px-3 py-1 text-xs font-bold text-slate-700">
                                            {d.status ?? "-"}
                                        </span>
                                    </div>

                                    <div className="col-span-4 text-xs text-slate-600">
                                        {formatDate(d.createdAt)}
                                    </div>

                                    <div className="col-span-1 text-right">
                                        <button
                                            type="button"
                                            onClick={() => onDeleteDoc(d.documentId)}
                                            disabled={docLoading}
                                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!docLoading && docPage && docPage.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-3">
                        <div className="text-xs text-[#8B84A0]">
                            {docPage.totalElements}개 · {docPage.number + 1}/{docPage.totalPages} 페이지
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={docLoading || page <= 0}
                                className="rounded-xl border border-[#E9DFFB] bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-[#FCFAFF] disabled:opacity-50"
                            >
                                이전
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage((p) => (docPage ? Math.min(docPage.totalPages - 1, p + 1) : p + 1))
                                }
                                disabled={docLoading || (docPage ? page >= docPage.totalPages - 1 : false)}
                                className="rounded-xl border border-[#E9DFFB] bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-[#FCFAFF] disabled:opacity-50"
                            >
                                다음
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}