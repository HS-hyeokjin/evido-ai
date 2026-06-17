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