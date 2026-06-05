import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    timeout: 15000,
});

let isRefreshing = false;

const isAuthEndpoint = (url?: string) => {
    if (!url) return false;

    return (
        url.includes("/api/auth/session") ||
        url.includes("/api/auth/guest/token") ||
        url.includes("/api/auth/refresh") ||
        url.includes("/api/auth/logout")
    );
};

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;

        if (!originalRequest) {
            return Promise.reject(err);
        }

        const status = err.response?.status;
        const requestUrl = originalRequest.url;

        if (
            status === 401 &&
            !originalRequest._retry &&
            !isAuthEndpoint(requestUrl)
        ) {
            originalRequest._retry = true;

            try {
                if (!isRefreshing) {
                    isRefreshing = true;

                    await axios.post(
                        `${API_BASE}/api/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );
                }

                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(err);
    }
);

export default api;