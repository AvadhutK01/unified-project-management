export interface PermissionModule {
    module: string;
    add: boolean;
    edit: boolean;
    view: boolean;
    delete: boolean;
    list: boolean;
}

export type PermissionField = keyof Omit<PermissionModule, "module">;

export interface CreateRolePayload {
    name: string;
    description: string;
    permissions: PermissionModule[];
}
