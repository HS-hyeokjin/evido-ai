import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
    timeout: 15000,
});

let isRefreshing = false;

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (!isRefreshing) {
                    isRefreshing = true;
                    await axios.post(
                        "http://localhost:8080/api/auth/refresh",
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