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
}

export function unwrapResponse<T>(response: CommonResponse<T>): T | null {
    if (!response.success) {
        throw new Error(response.message || "요청 처리 중 오류가 발생했습니다.");
    }

    return response.data;
}