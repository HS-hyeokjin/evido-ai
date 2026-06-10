import { memo } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { AlertTriangle, Download } from "lucide-react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import workerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";

type PdfViewerProps = {
    url: string;
    filename?: string;
    title?: string;
    className?: string;
    height?: number;
};

function PdfViewerInner({
                            url,
                            filename,
                            title,
                            className,
                            height,
                        }: Required<Pick<PdfViewerProps, "url" | "title" | "height">> &
    Omit<PdfViewerProps, "url" | "title" | "height">) {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

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
                        {filename ?? url}
                    </div>
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
                <Worker workerUrl={workerUrl}>
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

                                    <div className="mt-2 break-words text-xs font-semibold text-rose-700">
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

function PdfViewer({
                       url,
                       filename,
                       title = "PDF 미리보기",
                       className,
                       height = 640,
                   }: PdfViewerProps) {
    if (!url) {
        return (
            <div
                className={[
                    "rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600",
                    className,
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                PDF URL이 없습니다.
            </div>
        );
    }

    return (
        <PdfViewerInner
            key={url}
            url={url}
            filename={filename}
            title={title}
            className={className}
            height={height}
        />
    );
}

export default memo(PdfViewer);