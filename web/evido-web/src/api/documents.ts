import type { AxiosProgressEvent } from "axios";
import api from "./client";
import type { CommonResponse } from "../types/ApiResponse";

export type PageResponse<T> = {
    content: T[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
};

export type DocumentListItem = {
    documentId: number;
    latestVersionId?: number | null;
    title?: string | null;
    filename?: string | null;
    status?: string | null;
    createdAt?: string | null;
};

export type BulkUploadSuccessItem = {
    fileId: number;
    documentId: number;
    versionId: number;
    title: string;
};

export type BulkUploadFailedItem = {
    filename: string;
    reason: string;
};

export type BulkUploadResponse = {
    success: BulkUploadSuccessItem[];
    failed: BulkUploadFailedItem[];
};

export type ListDocumentsParams = {
    query?: string;
    page?: number;
    size?: number;
    sort?: string;
};

export type UploadDocumentsBulkParams = {
    titlePrefix?: string;
    files: File[];
    onProgress?: (percent: number) => void;
};

const documentBasePath = (workspaceId: number) =>
    `/api/workspaces/${workspaceId}/documents`;

export async function listDocuments(
    workspaceId: number,
    params: ListDocumentsParams = {}
): Promise<PageResponse<DocumentListItem>> {
    const { data } = await api.get<CommonResponse<PageResponse<DocumentListItem>>>(
        documentBasePath(workspaceId),
        {
            params: {
                q: params.query,
                page: params.page ?? 0,
                size: params.size ?? 10,
                sort: params.sort ?? "createdAt,desc",
            },
        }
    );

    return data.data;
}

export async function deleteDocument(
    workspaceId: number,
    documentId: number
): Promise<void> {
    await api.delete<CommonResponse<null>>(
        `${documentBasePath(workspaceId)}/${documentId}`
    );
}

export async function uploadDocumentsBulk(
    workspaceId: number,
    params: UploadDocumentsBulkParams
): Promise<BulkUploadResponse> {
    const formData = new FormData();

    if (params.titlePrefix?.trim()) {
        formData.append("titlePrefix", params.titlePrefix.trim());
    }

    for (const file of params.files) {
        formData.append("files", file);
    }

    const { data } = await api.post<CommonResponse<BulkUploadResponse>>(
        `${documentBasePath(workspaceId)}/bulk`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (event: AxiosProgressEvent) => {
                if (!params.onProgress || !event.total) return;

                const percent = Math.round((event.loaded * 100) / event.total);
                params.onProgress(percent);
            },
        }
    );

    return data.data;
}

export async function getDocumentTextContent(
    workspaceId: number,
    documentId: number,
    versionId?: number
): Promise<string> {
    const { data } = await api.get<string>(
        `${documentBasePath(workspaceId)}/${documentId}/content`,
        {
            params: {
                versionId,
            },
            responseType: "text",
        }
    );

    return data;
}

export function getDocumentFileUrl(
    workspaceId: number,
    documentId: number,
    versionId?: number
): string {
    const url = new URL(
        `${documentBasePath(workspaceId)}/${documentId}/file`,
        window.location.origin
    );

    if (typeof versionId === "number") {
        url.searchParams.set("versionId", String(versionId));
    }

    return url.pathname + url.search;
}

export async function getDocumentDownloadUrl(
    workspaceId: number,
    documentId: number,
    versionId?: number
): Promise<string> {
    const { data } = await api.get<CommonResponse<string>>(
        `${documentBasePath(workspaceId)}/${documentId}/download`,
        {
            params: {
                versionId,
            },
        }
    );

    return data.data;
}