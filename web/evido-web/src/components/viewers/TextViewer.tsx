import { memo, useEffect, useMemo, useState } from "react";
import { Copy, Download, Search } from "lucide-react";
import { getDocumentTextContent } from "../../api/documents";

type Props = {
    workspaceId: number;
    documentId: number;
    versionId?: number;
    downloadUrl?: string;
    filename?: string;
    title?: string;
    className?: string;
    maxChars?: number;
    height?: number;
};

function extOf(name?: string) {
    if (!name) return "";

    const lower = name.toLowerCase();
    const dot = lower.lastIndexOf(".");

    return dot >= 0 ? lower.slice(dot + 1) : "";
}

function TextViewer({
                        workspaceId,
                        documentId,
                        versionId,
                        downloadUrl,
                        filename,
                        title = "텍스트 미리보기",
                        className,
                        maxChars = 300_000,
                        height = 620,
                    }: Props) {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [text, setText] = useState("");

    const [q, setQ] = useState("");
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [lineNumbers, setLineNumbers] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                setLoading(true);
                setErr(null);
                setText("");

                const raw = await getDocumentTextContent(
                    workspaceId,
                    documentId,
                    versionId
                );

                if (!mounted) return;

                const clipped =
                    raw.length > maxChars
                        ? raw.slice(0, maxChars) + "\n\n...(truncated)"
                        : raw;

                setText(clipped);
            } catch (e: any) {
                if (!mounted) return;

                console.error(e);
                setErr(
                    e?.response?.data?.message ??
                    e?.message ??
                    "텍스트 불러오기 실패"
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, [workspaceId, documentId, versionId, maxChars]);

    const fileLabel = useMemo(() => {
        const ext = extOf(filename);

        if (!filename) return "TEXT";

        return ext ? `${filename} · ${ext.toUpperCase()}` : filename;
    }, [filename]);

    const lines = useMemo(() => {
        return text.split("\n").map((line, index) => ({
            no: index + 1,
            text: line,
        }));
    }, [text]);

    const filteredLines = useMemo(() => {
        const query = q.trim();

        if (!query) return lines;

        const needle = caseSensitive ? query : query.toLowerCase();

        return lines.filter((line) => {
            const hay = caseSensitive ? line.text : line.text.toLowerCase();
            return hay.includes(needle);
        });
    }, [lines, q, caseSensitive]);

    const isTruncated = text.endsWith("...(truncated)");

    const onCopy = async () => {
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);
            alert("복사 완료");
        } catch {
            alert("복사 실패. 브라우저 권한을 확인해주세요.");
        }
    };

    return (
        <div
            className={[
                "overflow-hidden rounded-2xl border border-slate-200 bg-white",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="min-w-0">
                    <div className="truncate text-sm font-black text-slate-900">
                        {title}
                    </div>

                    <div className="mt-0.5 truncate text-xs text-slate-500">
                        {fileLabel}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {loading && (
                        <span className="hidden rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700 sm:inline-flex">
                            불러오는 중...
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onCopy}
                        disabled={!text || loading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Copy className="h-4 w-4" />
                        복사
                    </button>

                    {downloadUrl && (
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                        >
                            <Download className="h-4 w-4" />
                            다운로드
                        </a>
                    )}
                </div>
            </div>

            <div className="border-b border-slate-100 bg-white px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="텍스트 검색"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-primary-300 focus:bg-white"
                        />
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-xs font-bold text-slate-600">
                        <label className="inline-flex items-center gap-1.5">
                            <input
                                type="checkbox"
                                checked={lineNumbers}
                                onChange={(e) => setLineNumbers(e.target.checked)}
                            />
                            줄번호
                        </label>

                        <label className="inline-flex items-center gap-1.5">
                            <input
                                type="checkbox"
                                checked={caseSensitive}
                                onChange={(e) => setCaseSensitive(e.target.checked)}
                            />
                            대소문자
                        </label>
                    </div>
                </div>
            </div>

            <div style={{ height }} className="overflow-auto bg-white">
                {err ? (
                    <div className="p-4">
                        <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                            {err}
                        </div>
                    </div>
                ) : text ? (
                    <div className="w-full min-w-0">
                        {filteredLines.length === 0 ? (
                            <div className="flex h-full min-h-[240px] items-center justify-center text-sm font-semibold text-slate-500">
                                검색 결과가 없습니다.
                            </div>
                        ) : (
                            filteredLines.map((line) => (
                                <div
                                    key={line.no}
                                    className="flex min-w-0 border-b border-slate-100 last:border-b-0"
                                >
                                    {lineNumbers && (
                                        <div className="w-14 shrink-0 select-none border-r border-slate-100 bg-slate-50 px-3 py-1 text-right text-[11px] font-bold text-slate-400">
                                            {line.no}
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1 whitespace-pre-wrap break-words px-3 py-1 font-mono text-[12px] leading-relaxed text-slate-800">
                                        {line.text || " "}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
                        {loading ? "텍스트를 불러오는 중..." : "표시할 텍스트가 없습니다."}
                    </div>
                )}
            </div>

            {isTruncated && (
                <div className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700">
                    내용이 너무 길어서 일부만 표시했어요. 다운로드로 전체를 확인하세요.
                </div>
            )}
        </div>
    );
}

export default memo(TextViewer);