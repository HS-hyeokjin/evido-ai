import { useMemo, useRef, useState } from "react";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { uploadDocumentsBulk, type BulkUploadResponse } from "../../api/documents";

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
        return { ok: false, reason: '허용되지 않은 확장자(${ext || "없음"})' };
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

export default function DocumentsUploadPage() {
    const [title, setTitle] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [rejected, setRejected] = useState<RejectedItem[]>([]);
    const [result, setResult] = useState<BulkUploadResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState<number>(0);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const acceptedHint = "PDF/DOCX/TXT/MD";
    const maxHint = prettySize(MAX_BYTES);

    const summaryLabel = useMemo(() => {
        if (files.length === 0) return `파일/폴더를 드래그해서 놓거나 클릭해서 선택 (${acceptedHint})`;
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

            const dup = next.some(
                (x) => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified
            );
            if (!dup) next.push(f);
        }

        if (rejectedItems.length > 0) {
            setRejected((prev) => [...rejectedItems, ...prev].slice(0, 50)); // 너무 길어지지 않게 50개 제한
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
            alert(`허용 파일(${acceptedHint})이 없음. 폴더를 드롭했으면 확장자를 확인.`);
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

    const onUpload = async () => {
        if (files.length === 0) return alert("파일 선택!");
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
            alert(e?.response?.data?.message ?? "업로드 실패(백엔드 확인)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-4">
            <h1 className="text-xl font-black">문서 업로드</h1>

            <Card>
                <div className="grid gap-4">
                    <div>
                        <div className="mb-2 text-sm font-extrabold">문서 제목 Prefix(옵션)</div>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예) 점검 매뉴얼" />
                        <div className="mt-2 text-xs text-slate-500">
                            * 폴더 드롭 시 파일이 많을 수 있어. 허용 확장자만 추려서 추가됨. (최대 {maxHint})
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.docx,.txt,.md"
                        onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
                        className="hidden"
                    />

                    <div>
                        <div className="mb-2 text-sm font-extrabold">파일/폴더 드래그&드롭</div>

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
                                "rounded-2xl border-2 border-dashed p-4 transition",
                                loading ? "border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed" : "",
                                !loading && isDragging ? "border-primary-500 bg-primary-50" : "",
                                !loading && !isDragging ? "border-slate-200 bg-white hover:bg-slate-50" : "",
                            ].join(" ")}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-bold">{summaryLabel}</div>
                                    <div className="mt-1 text-xs text-slate-500">
                                        클릭 또는 드래그&드롭 · 허용: {acceptedHint} · 최대 {maxHint}
                                    </div>
                                </div>

                                <span className="shrink-0 rounded-xl bg-primary-100 px-3 py-2 text-xs font-bold text-primary-700">
                  추가
                </span>
                            </div>
                        </div>

                        {loading && (
                            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="font-bold">업로드 진행률</div>
                                    <div className="font-black text-primary-700">{progress}%</div>
                                </div>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}

                        {files.length > 0 && (
                            <div className="mt-3 rounded-2xl border border-slate-200 bg-white">
                                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                                    <div className="text-sm font-black">선택된 파일</div>
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        disabled={loading}
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50 disabled:opacity-60"
                                    >
                                        전체 제거
                                    </button>
                                </div>

                                <ul className="divide-y divide-slate-200">
                                    {files.map((f, idx) => (
                                        <li key={`${f.name}-${f.size}-${f.lastModified}-${idx}`} className="flex items-center justify-between gap-3 px-4 py-3">
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-bold">{f.name}</div>
                                                <div className="mt-1 text-xs text-slate-500">
                                                    {prettySize(f.size)} · {f.type || "mime:unknown"}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                disabled={loading}
                                                className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50 disabled:opacity-60"
                                            >
                                                제거
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {rejected.length > 0 && (
                            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-black text-amber-900">제외된 파일</div>
                                    <button
                                        type="button"
                                        onClick={() => setRejected([])}
                                        disabled={loading}
                                        className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold hover:bg-amber-100 disabled:opacity-60"
                                    >
                                        목록 비우기
                                    </button>
                                </div>
                                <div className="mt-1 text-xs text-amber-800">
                                    허용: {acceptedHint} · 최대 {maxHint} · (MIME은 보조 체크)
                                </div>

                                <ul className="mt-2 space-y-2">
                                    {rejected.slice(0, 10).map((r, idx) => (
                                        <li key={`${r.name}-${idx}`} className="rounded-xl border border-amber-200 bg-white p-3">
                                            <div className="truncate text-sm font-bold">{r.name}</div>
                                            <div className="mt-1 text-xs text-slate-600">{prettySize(r.size)}</div>
                                            <div className="mt-1 text-xs font-bold text-amber-700">{r.reason}</div>
                                        </li>
                                    ))}
                                </ul>

                                {rejected.length > 10 && (
                                    <div className="mt-2 text-xs text-amber-800">
                                        * {rejected.length}개 중 10개만 표시 중 (너무 길어지는 것 방지)
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Button onClick={onUpload} disabled={loading || files.length === 0} className="w-full">
                        {loading ? "업로드 중..." : `한 번에 업로드 (${files.length}개)`}
                    </Button>
                </div>
            </Card>

            {result && (
                <div className="grid gap-3 md:grid-cols-2">
                    <Card>
                        <div className="mb-2 font-black">성공</div>
                        {result.success.length === 0 ? (
                            <div className="text-sm text-slate-500">성공한 항목이 없음.</div>
                        ) : (
                            <ul className="space-y-2">
                                {result.success.map((r) => (
                                    <li
                                        key={`${r.documentId}-${r.versionId}-${r.fileId}`}
                                        className="rounded-xl border border-slate-200 p-3"
                                    >
                                        <div className="font-extrabold">{r.title}</div>
                                        <div className="mt-1 text-xs text-slate-600">
                                            doc #{r.documentId} · ver #{r.versionId} · file #{r.fileId} · {r.status}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    <Card>
                        <div className="mb-2 font-black">실패</div>
                        {result.failed.length === 0 ? (
                            <div className="text-sm text-slate-500">실패한 항목이 없음.</div>
                        ) : (
                            <ul className="space-y-2">
                                {result.failed.map((f, idx) => (
                                    <li key={`${f.filename}-${idx}`} className="rounded-xl border border-slate-200 p-3">
                                        <div className="font-extrabold">{f.filename}</div>
                                        <div className="mt-1 text-xs text-rose-600">{f.reason}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
