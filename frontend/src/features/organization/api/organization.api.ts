import { api } from "@/lib/axios";

export interface Organization {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    ownerUserId: string;
    websiteUrl: string | null;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrganizationsResponse {
    status: string;
    data: {
        organizations: Organization[];
        pagination: {
            limit: number;
            page: number;
            total: number;
            totalPages: number;
        };
    };
}

/**
 * Fetch all organizations for the current user.
 *
 * @returns The API response containing the list of organizations.
 */
export const fetchOrganizations = async (): Promise<OrganizationsResponse> => {
    const { data } = await api.get("/organizations");
    return data;
};

export const createOrganization = async (payload: {
    name: string;
    slug: string;
    logo: File | null;
    websiteUrl?: string;
    description?: string;
}): Promise<Organization> => {
    const formData = new FormData();

    formData.append("name", payload.name);
    formData.append("slug", payload.slug);

    if (payload.logo) {
        formData.append("logo", payload.logo);
    }

    if (payload.websiteUrl) {
        formData.append("websiteUrl", payload.websiteUrl);
    }

    if (payload.description) {
        formData.append("description", payload.description);
    }

    const { data } = await api.post("/organizations", formData);
    return data.data;
};

export const updateOrganization = async (
    id: string,
    payload: {
        name: string;
        slug: string;
        websiteUrl?: string | null;
        description?: string | null;
        status?: string;
    },
): Promise<Organization> => {
    const { data } = await api.put(`/organizations/${id}`, payload);
    return data.data;
};
