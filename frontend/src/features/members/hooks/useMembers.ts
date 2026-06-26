import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    fetchInvitations,
    fetchMembers,
    fetchMemberById,
    inviteMembers,
    removeMember,
    revokeInvitation,
    updateMember,
    updateInvitationStatus,
    reInviteMembers,
} from "../api/members.api";

export const useInviteMembersMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: inviteMembers,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
        },
    });
};

export const useMembersQuery = (type: string, page = 1, search = "") => {
    return useQuery({
        queryKey: ["members", type, page, search],
        queryFn: () => fetchMembers({ type, page, search }),
    });
};

export const useInfiniteMembersQuery = (
    type: string,
    search = "",
    isForProject: boolean,
) => {
    return useInfiniteQuery({
        queryKey: ["members", type, search, isForProject],
        queryFn: ({ pageParam }) =>
            fetchMembers({
                type,
                page: pageParam,
                search,
                isForProject,
            }),

        initialPageParam: 1,

        getNextPageParam: (lastPage) => {
            const pagination = lastPage.data.pagination;

            return pagination.page < pagination.totalPages
                ? pagination.page + 1
                : undefined;
        },
    });
};

export const useMemberByIdQuery = (memberId: string | null) => {
    return useQuery({
        queryKey: ["members", memberId],
        queryFn: () => fetchMemberById(memberId!),
        enabled: !!memberId,
    });
};

export const useUpdateMemberMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...payload
        }: {
            id: string;
            roleId: string;
            status: string;
        }) => updateMember(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
        },
    });
};

export const useRemoveMemberMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
        },
    });
};

export const useRevokeInvitationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: revokeInvitation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
        },
    });
};

export const useUpdateInvitationStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            status,
        }: {
            id: string;
            status: "accepted" | "rejected";
        }) => updateInvitationStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] });
            queryClient.invalidateQueries({ queryKey: ["members"] });
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
    });
};

export const useFetchInvitationsQuery = () => {
    return useQuery({
        queryKey: ["invitations"],
        queryFn: fetchInvitations,
    });
};

export const useReInviteMembersMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reInviteMembers,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
        },
    });
};
