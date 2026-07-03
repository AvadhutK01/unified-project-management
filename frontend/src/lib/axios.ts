import { useOrganizationStore } from "@/store/organization.store";
import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_API_BASE_URL,
    // timeout: 100000,
    headers: {
        "ngrok-skip-browser-warning": "true",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    const activeOrganization =
        useOrganizationStore.getState().activeOrganization;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (activeOrganization) {
            config.headers["org_id"] = activeOrganization.id;
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            window.location.href = "/org-setup/select";
        }

        if (error.response?.status === 401) {
            localStorage.clear();

            useOrganizationStore.getState().setActiveOrganization(null);

            window.location.href = "/login";
        }

        return Promise.reject(error);
    },
);
