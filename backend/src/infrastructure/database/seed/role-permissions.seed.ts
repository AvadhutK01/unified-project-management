import { db } from "../client.js";
import { permissions } from "../schema/index.js";

/**
 * Seeds the permissions table with role module permissions.
 */
export const seedRolePermissions = async () => {
    const rolePermissions = [
        {
            name: "Add Role",
            codename: "roles_add",
            description: "Permission to create a new role",
        },
        {
            name: "Edit Role",
            codename: "roles_edit",
            description: "Permission to update an existing role",
        },
        {
            name: "Change Role Status",
            codename: "roles_status",
            description: "Permission to activate or deactivate a role",
        },
        {
            name: "Delete Role",
            codename: "roles_delete",
            description: "Permission to delete a role",
        },
        {
            name: "List Roles",
            codename: "roles_list",
            description: "Permission to view all roles",
        },
    ];

    for (const permission of rolePermissions) {
        await db.insert(permissions).values(permission).onConflictDoNothing();
    }

    console.log("✅ Role permissions seeded successfully");
};
