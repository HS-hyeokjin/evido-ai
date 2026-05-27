export type CommonResponse<T> = {
    success: boolean;
    code: string;
    message: string;
    data: T;
};

export const unwrapResponse = <T>(body: CommonResponse<T> | T): T => {
    if (
        body &&
        typeof body === "object" &&
        "success" in body &&
        "code" in body &&
        "data" in body
    ) {
        return (body as CommonResponse<T>).data;
    }

    return body as T;
};