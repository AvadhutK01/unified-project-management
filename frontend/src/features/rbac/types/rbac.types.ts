export const PERMISSIONS = {
    ROLES: {
        LIST: "roles_list",
        ADD: "roles_add",
        EDIT: "roles_edit",
        VIEW: "roles_view",
        DELETE: "roles_delete",
    },
    MEMBERS: {
        LIST: "members_list",
        ADD: "members_add",
        EDIT: "members_edit",
        VIEW: "members_view",
        DELETE: "members_delete",
    },
} as const;

export type PermissionCodename = string;
