export const PERMISSIONS = {
    ROLES: {
        LIST: "roles_list",
        ADD: "roles_add",
        EDIT: "roles_edit",
        VIEW: "roles_view",
        DELETE: "roles_delete",
    },
    MEMBERS_JOINED: {
        LIST: "members_joined_list",
        ADD: "members_joined_add",
        EDIT: "members_joined_edit",
        VIEW: "members_joined_view",
        DELETE: "members_joined_delete",
    },
    MEMBERS_INVITED: {
        LIST: "members_invited_list",
        ADD: "members_invited_add",
        EDIT: "members_invited_edit",
        VIEW: "members_invited_view",
        DELETE: "members_invited_delete",
    },
    PROJECTS: {
        LIST: "project_list",
        ADD: "project_add",
        EDIT: "project_edit",
        VIEW: "project_view",
        DELETE: "project_delete",
    },
    PHASES: {
        LIST: "phase_list",
        ADD: "phase_add",
        EDIT: "phase_edit",
        VIEW: "phase_view",
        DELETE: "phase_delete",
    },
    SPRINT: {
        LIST: "sprint_list",
        ADD: "sprint_add",
        EDIT: "sprint_edit",
        VIEW: "sprint_view",
        DELETE: "sprint_delete",
        STATUS: "sprint_status",
    },
    WORKITEM: {
        LIST: "workitem_list",
        ADD: "workitem_add",
        EDIT: "workitem_edit",
        VIEW: "workitem_view",
        DELETE: "workitem_delete",
        STATUS: "workitem_status",
    },
    REPORTS: {
        VIEW: "report_view",
    },
} as const;

export type PermissionCodename = string;
