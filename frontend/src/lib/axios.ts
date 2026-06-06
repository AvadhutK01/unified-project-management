import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_API_BASE_URL,
    timeout: 10000,
    headers: {
        "ngrok-skip-browser-warning": "true",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
