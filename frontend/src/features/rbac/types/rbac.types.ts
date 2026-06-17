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
    PROJECTS: {
        LIST: "project_list",
        ADD: "project_add",
        EDIT: "project_edit",
        VIEW: "project_view",
        DELETE: "project_delete",
    },
} as const;

export type PermissionCodename = string;
