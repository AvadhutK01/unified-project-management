import { describe, it, expect, beforeAll } from "vitest";
import {
    createRole,
    getRoleById,
    getAllRoles,
    updateRole,
    deleteRole,
} from "../src/modules/roles/application/role.use-cases.js";
import { getAllPermissions } from "../src/modules/roles/application/permission.use-cases.js";
import {
    createPermission,
    findPermissionByCodename,
} from "../src/modules/roles/infrastructure/permission.repository.js";

describe("Roles and Permissions Flow Integration Tests", () => {
    let createdPermissionIds: string[] = [];
    let createdRoleId: string;

    beforeAll(async () => {
        const perm1 = await createPermission({
            name: "Test Create Permission",
            codename: `test_create_${Date.now()}`,
            description: "Test permission for creation",
        });
        const perm2 = await createPermission({
            name: "Test Edit Permission",
            codename: `test_edit_${Date.now()}`,
            description: "Test permission for editing",
        });
        const perm3 = await createPermission({
            name: "Test Delete Permission",
            codename: `test_delete_${Date.now()}`,
            description: "Test permission for deletion",
        });

        if (perm1) createdPermissionIds.push(perm1.id);
        if (perm2) createdPermissionIds.push(perm2.id);
        if (perm3) createdPermissionIds.push(perm3.id);
    });

    /**
     * Test role creation with permissions.
     */
    it("should successfully create a new role with permissions", async () => {
        const roleName = `Test_Role_${Date.now()}`;
        const role = await createRole({
            name: roleName,
            description: "Test role for integration testing",
            permissionIds: createdPermissionIds.slice(0, 2),
            isActive: true,
        });

        expect(role.id).toBeDefined();
        expect(role.name).toBe(roleName);
        expect(role.description).toBe("Test role for integration testing");
        expect(role.isActive).toBe(true);
        expect(role.permissions).toBeDefined();
        expect(role.permissions.length).toBe(2);
        expect(role.permissions[0].id).toBe(createdPermissionIds[0]);

        createdRoleId = role.id;
    });

    /**
     * Test role creation without permissions.
     */
    it("should successfully create a role without permissions", async () => {
        const roleName = `Test_Role_No_Perms_${Date.now()}`;
        const role = await createRole({
            name: roleName,
            description: "Role without initial permissions",
        });

        expect(role.id).toBeDefined();
        expect(role.name).toBe(roleName);
        expect(role.permissions).toBeDefined();
        expect(role.permissions.length).toBe(0);
    });

    /**
     * Test that duplicate role names are rejected.
     */
    it("should reject creation if role name already exists", async () => {
        const roleName = `Unique_Role_${Date.now()}`;

        await createRole({
            name: roleName,
            description: "First role",
        });

        await expect(
            createRole({
                name: roleName,
                description: "Duplicate name",
            }),
        ).rejects.toThrow("Role with this name already exists");
    });

    /**
     * Test retrieving role by ID.
     */
    it("should successfully retrieve a role by ID with its permissions", async () => {
        const role = await getRoleById(createdRoleId);

        expect(role.id).toBe(createdRoleId);
        expect(role.name).toBeDefined();
        expect(role.permissions).toBeDefined();
        expect(Array.isArray(role.permissions)).toBe(true);
    });

    /**
     * Test retrieving non-existent role.
     */
    it("should throw error when retrieving non-existent role", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";

        await expect(getRoleById(fakeId)).rejects.toThrow("Role not found");
    });

    /**
     * Test retrieving all roles with pagination.
     */
    it("should successfully retrieve all roles with pagination", async () => {
        const result = await getAllRoles(1, 10);

        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.pagination).toBeDefined();
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.limit).toBe(10);
        expect(result.pagination.total).toBeGreaterThanOrEqual(0);
        expect(result.pagination.totalPages).toBeGreaterThanOrEqual(0);

        if (result.data.length > 0) {
            expect(result.data[0].permissions).toBeDefined();
        }
    });

    /**
     * Test retrieving roles with search filter.
     */
    it("should successfully search roles by name", async () => {
        const searchTerm = "Test_Role";
        const result = await getAllRoles(1, 10, searchTerm);

        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);

        result.data.forEach((role) => {
            expect(
                role.name.toLowerCase().includes(searchTerm.toLowerCase()),
            ).toBe(true);
        });
    });

    /**
     * Test updating role with new permissions.
     */
    it("should successfully update a role and its permissions", async () => {
        const newRoleName = `Updated_Role_${Date.now()}`;
        const newDescription = "Updated description";

        const updated = await updateRole(createdRoleId, {
            name: newRoleName,
            description: newDescription,
            permissionIds: createdPermissionIds,
            isActive: true,
        });

        expect(updated.id).toBe(createdRoleId);
        expect(updated.name).toBe(newRoleName);
        expect(updated.description).toBe(newDescription);
        expect(updated.permissions.length).toBe(createdPermissionIds.length);
    });

    /**
     * Test updating role without changing permissions.
     */
    it("should successfully update a role without modifying permissions", async () => {
        const newStatus = false;

        const updated = await updateRole(createdRoleId, {
            isActive: newStatus,
        });

        expect(updated.id).toBe(createdRoleId);
        expect(updated.isActive).toBe(newStatus);
    });

    /**
     * Test that duplicate names are rejected on update.
     */
    it("should reject role update if new name already exists", async () => {
        const role1 = await createRole({
            name: `Role1_${Date.now()}`,
        });
        const role2 = await createRole({
            name: `Role2_${Date.now()}`,
        });

        await expect(
            updateRole(role2.id, {
                name: role1.name,
            }),
        ).rejects.toThrow("Role with this name already exists");
    });

    /**
     * Test that invalid permission IDs are rejected.
     */
    it("should reject role creation with invalid permission IDs", async () => {
        const fakePermissionId = "00000000-0000-0000-0000-000000000000";

        await expect(
            createRole({
                name: `Test_Role_${Date.now()}`,
                permissionIds: [fakePermissionId],
            }),
        ).rejects.toThrow("Permission with ID");
    });

    /**
     * Test deleting a role.
     */
    it("should successfully delete a role", async () => {
        const roleToDelete = await createRole({
            name: `Role_To_Delete_${Date.now()}`,
        });

        const deleted = await deleteRole(roleToDelete.id);

        expect(deleted.id).toBe(roleToDelete.id);

        await expect(getRoleById(roleToDelete.id)).rejects.toThrow(
            "Role not found",
        );
    });

    /**
     * Test deleting a non-existent role.
     */
    it("should throw error when deleting non-existent role", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";

        await expect(deleteRole(fakeId)).rejects.toThrow("Role not found");
    });

    /**
     * Test retrieving all permissions with pagination.
     */
    it("should successfully retrieve all permissions with pagination", async () => {
        const result = await getAllPermissions(1, 10);

        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.pagination).toBeDefined();
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.limit).toBe(10);
        expect(result.pagination.total).toBeGreaterThanOrEqual(0);
        expect(result.pagination.totalPages).toBeGreaterThanOrEqual(0);
    });

    /**
     * Test searching permissions by name or codename.
     */
    it("should successfully search permissions by codename", async () => {
        const searchTerm = "test_create";
        const result = await getAllPermissions(1, 10, searchTerm);

        expect(result.data).toBeDefined();

        result.data.forEach((permission) => {
            const matchFound =
                permission.name.toLowerCase().includes(searchTerm) ||
                permission.codename.toLowerCase().includes(searchTerm);
            expect(matchFound).toBe(true);
        });
    });

    /**
     * Test creating a role with multiple permission reassignments.
     */
    it("should successfully reassign permissions multiple times", async () => {
        const role = await createRole({
            name: `Multi_Reassign_Role_${Date.now()}`,
            permissionIds: [createdPermissionIds[0]],
        });

        expect(role.permissions.length).toBe(1);

        const updated1 = await updateRole(role.id, {
            permissionIds: createdPermissionIds.slice(0, 2),
        });
        expect(updated1.permissions.length).toBe(2);

        const updated2 = await updateRole(role.id, {
            permissionIds: [createdPermissionIds[2]],
        });
        expect(updated2.permissions.length).toBe(1);
        expect(updated2.permissions[0].id).toBe(createdPermissionIds[2]);
    });

    /**
     * Test that permissions are properly linked to roles.
     */
    it("should maintain proper permission-role associations", async () => {
        const role = await getRoleById(createdRoleId);

        expect(role.permissions.length).toBeGreaterThan(0);

        for (const permission of role.permissions) {
            expect(permission.id).toBeDefined();
            expect(permission.name).toBeDefined();
            expect(permission.codename).toBeDefined();
        }
    });
});
