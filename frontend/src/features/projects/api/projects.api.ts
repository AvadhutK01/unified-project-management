import { api } from "@/lib/axios";

export const createProject = async (formData: FormData) => {
    const { data } = await api.post("/projects", formData);
    return data;
};

export const updateProject = async ({
    id,
    formData,
}: {
    id: string;
    formData: FormData;
}) => {
    const { data } = await api.put(`/projects/${id}`, formData);
    return data;
};

export const fetchProjectById = async (id: string) => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
};

export const deleteProject = async (id: string) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
};

export const fetchProjects = async ({
    page = 1,
    search = "",
}: {
    page?: number;
    search?: string;
} = {}) => {
    const params = new URLSearchParams({
        page: String(page),
    });

    if (search) {
        params.set("search", search);
    }

    const { data } = await api.get(`/projects?${params.toString()}`);
    return data;
};

export const fetchProjectMembers = async (projectId: string) => {
    const { data } = await api.get(
        `/organizations/members/project/${projectId}`,
    );
    return data;
};
