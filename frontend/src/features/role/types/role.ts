export type PermissionField = string;

export interface CreateRolePayload {
    name: string;
    description: string;
    permissionIds: string[];
}
