import { api } from "@/lib/axios";

export const inviteMembers = async (payload: {
    invitations: {
        email: string;
        roleId: string;
    }[];
}) => {
    const { data } = await api.post("/organizations/members/invite", payload);
    return data;
};

export const fetchMembers = async ({
    type,
    page = 1,
    limit = 10,
    search = "",
}: {
    type: string;
    page?: number;
    limit?: number;
    search?: string;
}) => {
    const params = new URLSearchParams({
        type,
        page: String(page),
        limit: String(limit),
    });

    if (search) {
        params.set("search", search);
    }

    const { data } = await api.get(
        `/organizations/members?${params.toString()}`,
    );
    return data;
};

export const fetchMemberById = async (memberId: string) => {
    const { data } = await api.get(`/organizations/members/${memberId}`);
    return data;
};

export const updateMember = async (
    memberId: string,
    payload: { roleId: string; status: string },
) => {
    const { data } = await api.put(
        `/organizations/members/${memberId}`,
        payload,
    );
    return data;
};

export const removeMember = async (memberId: string) => {
    const { data } = await api.delete(`/organizations/members/${memberId}`);
    return data;
};

export const revokeInvitation = async (memberId: string) => {
    const { data } = await api.delete(`/organizations/invitations/${memberId}`);
    return data;
};

export const updateInvitationStatus = async (
    id: string,
    status: "accepted" | "rejected",
) => {
    const { data } = await api.put(`/organizations/invitations/${id}/status`, {
        status,
    });
    return data;
};

export const reInviteMembers = async (payload: {
    email: string;
    roleId: string;
}) => {
    const { data } = await api.post(
        "/organizations/members/re-invite",
        payload,
    );
    return data;
};

export const fetchInvitations = async () => {
    const { data } = await api.get(`/organizations/invitations`);
    return data;
};
