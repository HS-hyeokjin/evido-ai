import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    timeout: 15000,
});

let isRefreshing = false;

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;
        console.log(API_BASE);
        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (!isRefreshing) {
                    isRefreshing = true;

                    await axios.post(
                        `${API_BASE}/api/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );

                    isRefreshing = false;
                }

                return api(originalRequest);
            } catch (refreshError) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(err);
    }
);

export default api;