import api from "./client";
import type { AxiosProgressEvent } from "axios";

export type DocumentCreateResponse = {
    documentId: number;
    versionId: number;
    fileId: number;
    title: string;
    status: string;
};

export type BulkUploadFailedItem = {
    filename: string;
    reason: string;
};

export type BulkUploadResponse = {
    success: DocumentCreateResponse[];
    failed: BulkUploadFailedItem[];
};

export async function uploadDocumentsBulk(params: {
    title?: string;
    files: File[];
    onProgress?: (percent: number, ev: AxiosProgressEvent) => void;
}) {
    const form = new FormData();
    if (params.title) form.append("title", params.title);
    params.files.forEach((f) => form.append("files", f));

    const res = await api.post<BulkUploadResponse>("/api/documents/bulk", form, {
        onUploadProgress: (ev) => {
            const total = ev.total ?? 0;
            if (!total) {
                params.onProgress?.(0, ev);
                return;
            }
            const percent = Math.round((ev.loaded / total) * 100);
            params.onProgress?.(percent, ev);
        },
    });

    return res.data;
}
