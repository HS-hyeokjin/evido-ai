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

export type DocumentListItem = {
    documentId: number;
    title: string;
    latestVersionId?: number | null;
    fileId?: number | null;
    filename?: string | null;
    createdAt?: string | null;
    status?: string | null;
};

export type PageResponse<T> = {
    content: T[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

export async function listDocuments(params: {
    query?: string;
    page?: number;
    size?: number;
    sort?: string;
}) {
    const { query, page = 0, size = 10, sort = "createdAt,desc" } = params;

    const res = await api.get<PageResponse<DocumentListItem>>("/api/documents", {
        params: {
            q: query || undefined,
            page,
            size,
            sort,
        },
    });

    return res.data;
}

export async function deleteDocument(documentId: number) {
    const res = await api.delete(`/api/documents/${documentId}`);
    return res.data;
}
