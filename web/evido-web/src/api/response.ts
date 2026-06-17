import { ApiError } from "./ApiError";
import type { CommonResponse } from "../types/ApiResponse";

export function unwrapData<T>(body: CommonResponse<T>): T {
    if (!body.success) {
        throw new ApiError(
            200,
            body.code ?? "UNKNOWN_ERROR",
            body.message ?? "요청 처리 중 오류가 발생했습니다."
        );
    }

    if (body.data === null) {
        throw new ApiError(
            200,
            "EMPTY_RESPONSE",
            "응답 데이터가 없습니다."
        );
    }

    return body.data;
}

export function unwrapVoid(body: CommonResponse<unknown>): void {
    if (!body.success) {
        throw new ApiError(
            200,
            body.code ?? "UNKNOWN_ERROR",
            body.message ?? "요청 처리 중 오류가 발생했습니다."
        );
    }
}

export function unwrapNullableData<T>(
    body: CommonResponse<T | null>
): T | null {
    if (!body.success) {
        throw new ApiError(
            200,
            body.code ?? "UNKNOWN_ERROR",
            body.message ?? "요청 처리 중 오류가 발생했습니다."
        );
    }

    return body.data;
}