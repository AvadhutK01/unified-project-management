import { db } from "../client.js";
import { permissions } from "../schema/index.js";

/**
 * Seeds the permissions table with both role and member module permissions.
 */
export const seedPermissions = async () => {
    const allPermissions = [
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
        {
            name: "Add Joined Member",
            codename: "members_joined_add",
            description: "Permission to add a joined member",
        },
        {
            name: "Edit Joined Member",
            codename: "members_joined_edit",
            description: "Permission to update a joined member",
        },
        {
            name: "View Joined Member",
            codename: "members_joined_view",
            description: "Permission to view a joined member",
        },
        {
            name: "Delete Joined Member",
            codename: "members_joined_delete",
            description: "Permission to delete a joined member",
        },
        {
            name: "List Joined Members",
            codename: "members_joined_list",
            description: "Permission to list joined members",
        },
        {
            name: "Add Invited Member",
            codename: "members_invited_add",
            description: "Permission to invite a member",
        },
        {
            name: "Edit Invited Member",
            codename: "members_invited_edit",
            description: "Permission to update an invited member",
        },
        {
            name: "View Invited Member",
            codename: "members_invited_view",
            description: "Permission to view an invited member",
        },
        {
            name: "Delete Invited Member",
            codename: "members_invited_delete",
            description: "Permission to delete an invited member",
        },
        {
            name: "List Invited Members",
            codename: "members_invited_list",
            description: "Permission to list invited members",
        },
        {
            name: "Add Project",
            codename: "project_add",
            description: "Permission to create a project",
        },
        {
            name: "Edit Project",
            codename: "project_edit",
            description: "Permission to edit project details",
        },
        {
            name: "View Project",
            codename: "project_view",
            description: "Permission to view a project",
        },
        {
            name: "Delete Project",
            codename: "project_delete",
            description: "Permission to delete a project",
        },
        {
            name: "List Projects",
            codename: "project_list",
            description: "Permission to list projects",
        },
        {
            name: "Add Phase",
            codename: "phase_add",
            description: "Permission to create a phase",
        },
        {
            name: "Edit Phase",
            codename: "phase_edit",
            description: "Permission to edit phase details",
        },
        {
            name: "View Phase",
            codename: "phase_view",
            description: "Permission to view a phase",
        },
        {
            name: "Delete Phase",
            codename: "phase_delete",
            description: "Permission to delete a phase",
        },
        {
            name: "List Phases",
            codename: "phase_list",
            description: "Permission to list phases",
        },
        {
            name: "Add Sprint",
            codename: "sprint_add",
            description: "Permission to create a sprint",
        },
        {
            name: "Edit Sprint",
            codename: "sprint_edit",
            description: "Permission to update an existing sprint",
        },
        {
            name: "View Sprint",
            codename: "sprint_view",
            description: "Permission to view a sprint",
        },
        {
            name: "Delete Sprint",
            codename: "sprint_delete",
            description: "Permission to delete a sprint",
        },
        {
            name: "List Sprints",
            codename: "sprint_list",
            description: "Permission to view all sprints",
        },
        {
            name: "Update Sprint Status",
            codename: "sprint_status",
            description: "Permission to update sprint status",
        },
        {
            name: "Add Work Item",
            codename: "workitem_add",
            description: "Permission to create a work item",
        },
        {
            name: "Edit Work Item",
            codename: "workitem_edit",
            description: "Permission to update an existing work item",
        },
        {
            name: "View Work Item",
            codename: "workitem_view",
            description: "Permission to view a work item",
        },
        {
            name: "Delete Work Item",
            codename: "workitem_delete",
            description: "Permission to delete a work item",
        },
        {
            name: "List Work Items",
            codename: "workitem_list",
            description: "Permission to view all work items",
        },
        {
            name: "Update Work Item Status",
            codename: "workitem_status",
            description: "Permission to update work item status",
        },
        {
            name: "View Report",
            codename: "report_view",
            description: "Permission to view reports",
        },
    ];

    for (const permission of allPermissions) {
        await db.insert(permissions).values(permission).onConflictDoNothing();
    }

    console.log("All permissions seeded successfully");
};
