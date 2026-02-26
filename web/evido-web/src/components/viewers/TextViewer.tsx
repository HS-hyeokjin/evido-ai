import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { Copy, Download } from "lucide-react";

type Props = {
    url: string;
    filename?: string;
    title?: string;
    className?: string;
    maxChars?: number;
};

function extOf(name?: string) {
    if (!name) return "";
    const lower = name.toLowerCase();
    const dot = lower.lastIndexOf(".");
    return dot >= 0 ? lower.slice(dot + 1) : "";
}

export default function TextViewer({
                                       url,
                                       filename,
                                       title,
                                       className,
                                       maxChars = 300_000,
                                   }: Props) {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [text, setText] = useState("");

    const [q] = useState("");
    const [caseSensitive] = useState(false);
    const [lineNumbers] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setErr(null);
                setText("");

                const res = await api.get(url, { responseType: "text" });

                if (!mounted) return;

                const raw =
                    typeof res.data === "string"
                        ? res.data
                        : JSON.stringify(res.data, null, 2);

                const clipped =
                    raw.length > maxChars
                        ? raw.slice(0, maxChars) + "\n\n...(truncated)"
                        : raw;

                setText(clipped);
            } catch (e: any) {
                if (!mounted) return;
                console.error(e);
                setErr(
                    e?.response?.data?.message ?? "텍스트 불러오기 실패"
                );
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [url, maxChars]);

    const fileLabel = useMemo(() => {
        const ext = extOf(filename);
        if (!filename) return "TEXT";
        return ext
            ? `${filename} · ${ext.toUpperCase()}`
            : filename;
    }, [filename]);

    const lines = useMemo(() => text.split("\n"), [text]);

    const filteredLines = useMemo(() => {
        const query = q.trim();
        if (!query) return lines;

        const needle = caseSensitive
            ? query
            : query.toLowerCase();

        return lines.filter((line) => {
            const hay = caseSensitive
                ? line
                : line.toLowerCase();
            return hay.includes(needle);
        });
    }, [lines, q, caseSensitive]);


    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            alert("복사 완료");
        } catch {
            alert("복사 실패(브라우저 권한 확인)");
        }
    };

    if (loading) {
        return (
            <div
                className={[
                    "rounded-2xl border border-slate-200 bg-white p-4",
                    className,
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <div className="text-sm font-extrabold text-slate-800">
                    {title ?? "텍스트 뷰어"}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                    불러오는 중...
                </div>
            </div>
        );
    }

    if (err) {
        return (
            <div
                className={[
                    "rounded-2xl border border-rose-200 bg-rose-50 p-4",
                    className,
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <div className="text-sm font-extrabold text-rose-800">
                    {title ?? "텍스트 뷰어"}
                </div>
                <div className="mt-2 text-sm font-semibold text-rose-700">
                    {err}
                </div>
            </div>
        );
    }

    return (
        <div
            className={[
                "rounded-2xl border border-slate-200 bg-white overflow-x-hidden",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 min-w-0">
                <div className="min-w-0">
                    <div className="truncate text-sm font-black text-slate-900">
                        {title ?? "텍스트 뷰어"}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                        {fileLabel}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <button
                        onClick={onCopy}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                        <Copy className="h-4 w-4" />
                        복사
                    </button>

                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                        <Download className="h-4 w-4" />
                        다운로드
                    </a>
                </div>
            </div>

            <div className="px-4 py-3 min-w-0">

                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="max-h-[600px] overflow-y-auto overflow-x-hidden">
                        <div className="w-full min-w-0">
                            {filteredLines.map((line, idx) => (
                                <div
                                    key={idx}
                                    className="flex min-w-0 border-b border-slate-100 last:border-b-0"
                                >
                                    {lineNumbers && (
                                        <div className="w-14 shrink-0 select-none border-r border-slate-100 bg-slate-50 px-3 py-1 text-right text-[11px] font-bold text-slate-400">
                                            {idx + 1}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0 px-3 py-1 font-mono text-[12px] leading-relaxed text-slate-800 whitespace-pre-wrap break-words break-all">
                                        {line || " "}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {text.endsWith("...(truncated)") && (
                    <div className="mt-2 text-xs text-amber-700">
                        내용이 너무 길어서 일부만 표시했어요.
                        다운로드로 전체를 확인하세요.
                    </div>
                )}
            </div>
        </div>
    );
}