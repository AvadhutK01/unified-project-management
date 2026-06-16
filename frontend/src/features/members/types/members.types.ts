export type RoleOption = {
    id: string;
    name: string;
};

export type InviteEntry = {
    id: string;
    email: string;
    role: string;
};

export type InviteEntryErrors = {
    email?: string;
    role?: string;
};

export interface InviteMembersModalProps {
    open: boolean;
    onClose: () => void;
    reInviteMode?: boolean;
    initialEmail?: string;
}

export interface Member {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "Active" | "Inactive";
    joinedAt: string;
}
