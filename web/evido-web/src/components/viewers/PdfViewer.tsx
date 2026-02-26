import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { AlertTriangle, Download } from "lucide-react";

const WORKER_URL = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

type Props = {
    url: string;
    filename?: string;
    title?: string;
    className?: string;
    height?: number;
};

export default function PdfViewer({ url, filename, title = "PDF 미리보기", className, height = 640 }: Props) {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();


    if (!url) {
        return (
            <div className={["rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600", className].filter(Boolean).join(" ")}>
                PDF URL이 없습니다.
            </div>
        );
    }

    return (
        <div className={["overflow-hidden rounded-2xl border border-slate-200 bg-white", className].filter(Boolean).join(" ")}>
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="min-w-0">
                    <div className="truncate text-sm font-black text-slate-900">{title}</div>
                    <div className="mt-0.5 truncate text-xs text-slate-500">{filename ?? url}</div>
                </div>

                <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                    <Download className="h-4 w-4" />
                    다운로드
                </a>
            </div>

            <div style={{ height }} className="bg-white">
                <Worker workerUrl={WORKER_URL}>
                    <Viewer
                        fileUrl={url}
                        plugins={[defaultLayoutPluginInstance]}
                        renderError={(error) => (
                            <div className="grid h-full place-items-center p-6">
                                <div className="max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-4">
                                    <div className="flex items-center gap-2 text-sm font-black text-rose-800">
                                        <AlertTriangle className="h-4 w-4" />
                                        PDF 로드 실패
                                    </div>
                                    <div className="mt-2 text-xs font-semibold text-rose-700 break-words">
                                        {String(error?.message ?? error)}
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                </Worker>
            </div>
        </div>
    );
}