import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "./ApiError";
import type { CommonResponse } from "../types/ApiResponse";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type RetryConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    timeout: 15000,
});

let refreshPromise: Promise<void> | null = null;

const refreshAccessToken = async () => {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(
                `${API_BASE}/api/auth/refresh`,
                {},
                {
                    withCredentials: true,
                    timeout: 15000,
                }
            )
            .then(() => undefined)
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

const toApiError = (error: AxiosError<CommonResponse<null>>): ApiError => {
    if (error.response) {
        const status = error.response.status;
        const body = error.response.data;

        return new ApiError(
            status,
            body?.code ?? `HTTP_${status}`,
            body?.message ?? getDefaultMessageByStatus(status)
        );
    }

    if (error.code === "ECONNABORTED") {
        return new ApiError(
            0,
            "REQUEST_TIMEOUT",
            "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
        );
    }

    if (error.request) {
        return new ApiError(
            0,
            "NETWORK_ERROR",
            "서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요."
        );
    }

    return new ApiError(
        0,
        "CLIENT_ERROR",
        "요청 처리 중 오류가 발생했습니다."
    );
};

const getDefaultMessageByStatus = (status: number): string => {
    switch (status) {
        case 400:
            return "잘못된 요청입니다.";
        case 401:
            return "로그인이 필요합니다.";
        case 403:
            return "접근 권한이 없습니다.";
        case 404:
            return "요청한 데이터를 찾을 수 없습니다.";
        case 413:
            return "업로드 가능한 최대 용량을 초과했습니다.";
        case 500:
            return "서버 오류가 발생했습니다.";
        case 502:
            return "외부 서버 호출 중 오류가 발생했습니다.";
        default:
            return "요청 처리 중 오류가 발생했습니다.";
    }
};

api.interceptors.response.use(
    (res) => res,

    async (err: AxiosError<CommonResponse<null>>) => {
        const originalRequest = err.config as RetryConfig | undefined;

        const status = err.response?.status;
        const requestUrl = originalRequest?.url ?? "";

        const isRefreshRequest = requestUrl.includes("/api/auth/refresh");

        if (
            status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isRefreshRequest
        ) {
            originalRequest._retry = true;

            try {
                await refreshAccessToken();

                return api(originalRequest);
            } catch {
                window.location.href = "/login";

                return Promise.reject(
                    new ApiError(
                        401,
                        "UNAUTHORIZED",
                        "로그인이 만료되었습니다. 다시 로그인해주세요."
                    )
                );
            }
        }

        return Promise.reject(toApiError(err));
    }
);

export default api;