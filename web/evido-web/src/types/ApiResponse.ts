import { ApiError } from "../api/ApiError";

export type CommonResponse<T> = {
    success: boolean;
    code: string | null;
    message: string | null;
    data: T | null;
};

export const isCommonResponse = <T>(
    body: unknown
): body is CommonResponse<T> => {
    return (
        !!body &&
        typeof body === "object" &&
        "success" in body &&
        "data" in body
    );
};

export const unwrapResponse = <T>(body: CommonResponse<T> | T): T => {
    if (isCommonResponse<T>(body)) {
        if (!body.success) {
            throw new ApiError(
                200,
                body.code ?? "UNKNOWN_ERROR",
                body.message ?? "요청 처리 중 오류가 발생했습니다."
            );
        }

        return body.data as T;
    }

    return body as T;
};