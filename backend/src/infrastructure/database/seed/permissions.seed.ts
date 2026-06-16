import { db } from "../client.js";
import { permissions } from "../schema/index.js";

/**
 * Seeds the permissions table with both role and member module permissions.
 */
export const seedPermissions = async () => {
    const allPermissions = [
        // Role permissions
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
            name: "View Role",
            codename: "roles_view",
            description: "Permission to view a role",
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
        // Member permissions
        {
            name: "Add Member",
            codename: "members_add",
            description: "Permission to invite/add members",
        },
        {
            name: "Edit Member",
            codename: "members_edit",
            description: "Permission to update member details",
        },
        {
            name: "View Member",
            codename: "members_view",
            description: "Permission to view member details",
        },
        {
            name: "Delete Member",
            codename: "members_delete",
            description: "Permission to remove/delete a member",
        },
        {
            name: "List Members",
            codename: "members_list",
            description: "Permission to list organization members",
        },
    ];

    for (const permission of allPermissions) {
        await db.insert(permissions).values(permission).onConflictDoNothing();
    }

    console.log("✅ All permissions seeded successfully");
};
