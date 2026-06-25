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
import {
    registerUser,
    verifyOtp,
} from "../src/modules/users/application/user.use-cases.js";
import { createOrganization } from "../src/modules/organizations/application/organization.use-cases.js";

describe("Roles and Permissions Flow Integration Tests", () => {
    let createdPermissionIds: string[] = [];
    let createdRoleId: string;
    let testOrgId: string;

    beforeAll(async () => {
        const uniqueTime = Date.now();
        const email = `test_role_user_${uniqueTime}@example.com`;
        const phone = `9999${String(uniqueTime).slice(-6)}`;

        // 1. Create a user
        const user = await registerUser({
            username: `role_test_user_${uniqueTime}`,
            email,
            phoneNumber: phone,
            password: "Password@123",
        });
        await verifyOtp({
            email,
            phoneNumber: phone,
            emailOtp: "123456",
            phoneOtp: "123456",
        });

        // 2. Create an organization
        const org = await createOrganization(
            {
                name: `Role_Test_Org_${uniqueTime}`,
                slug: `role-test-org-${uniqueTime}`,
            },
            user.id,
        );
        testOrgId = org.id;

        // 3. Create permissions with unique names
        const perm1 = await createPermission({
            name: `Test Create Permission ${uniqueTime}`,
            codename: `test_create_${uniqueTime}`,
            description: "Test permission for creation",
        });
        const perm2 = await createPermission({
            name: `Test Edit Permission ${uniqueTime}`,
            codename: `test_edit_${uniqueTime}`,
            description: "Test permission for editing",
        });
        const perm3 = await createPermission({
            name: `Test Delete Permission ${uniqueTime}`,
            codename: `test_delete_${uniqueTime}`,
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
            organizationId: testOrgId,
        });

        expect(role!.id).toBeDefined();
        expect(role.name).toBe(roleName);
        expect(role.description).toBe("Test role for integration testing");
        expect(role.isActive).toBe(true);
        expect(role.permissions).toBeDefined();
        expect(role.permissions.length).toBe(2);
        expect(role.permissions[0]!.id).toBe(createdPermissionIds[0]!);

        createdRoleId = role!.id;
    });

    /**
     * Test role creation without permissions.
     */
    it("should successfully create a role without permissions", async () => {
        const roleName = `Test_Role_No_Perms_${Date.now()}`;
        const role = await createRole({
            name: roleName,
            description: "Role without initial permissions",
            organizationId: testOrgId,
        });

        expect(role!.id).toBeDefined();
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
            organizationId: testOrgId,
        });

        await expect(
            createRole({
                name: roleName,
                description: "Duplicate name",
                organizationId: testOrgId,
            }),
        ).rejects.toThrow("Role with this name already exists");
    });

    /**
     * Test retrieving role by ID.
     */
    it("should successfully retrieve a role by ID with its permissions", async () => {
        const role = await getRoleById(createdRoleId, testOrgId);

        expect(role!.id).toBe(createdRoleId);
        expect(role.name).toBeDefined();
        expect(role.permissions).toBeDefined();
        expect(Array.isArray(role.permissions)).toBe(true);
    });

    /**
     * Test retrieving non-existent role.
     */
    it("should throw error when retrieving non-existent role", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";

        await expect(getRoleById(fakeId, testOrgId)).rejects.toThrow(
            "Role not found",
        );
    });

    /**
     * Test retrieving all roles with pagination.
     */
    it("should successfully retrieve all roles with pagination", async () => {
        const result = await getAllRoles(1, 10, undefined, testOrgId);

        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.pagination).toBeDefined();
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.limit).toBe(10);
        expect(result.pagination.total).toBeGreaterThanOrEqual(0);
        expect(result.pagination.totalPages).toBeGreaterThanOrEqual(0);

        if (result.data.length > 0) {
            expect(result.data[0]!.permissions).toBeDefined();
        }
    });

    /**
     * Test retrieving roles with search filter.
     */
    it("should successfully search roles by name", async () => {
        const searchTerm = "Test_Role";
        const result = await getAllRoles(1, 10, searchTerm, testOrgId);

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

        const updated = await updateRole(
            createdRoleId,
            {
                name: newRoleName,
                description: newDescription,
                permissionIds: createdPermissionIds,
                isActive: true,
            },
            testOrgId,
        );

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

        const updated = await updateRole(
            createdRoleId,
            {
                isActive: newStatus,
            },
            testOrgId,
        );

        expect(updated.id).toBe(createdRoleId);
        expect(updated.isActive).toBe(newStatus);
    });

    /**
     * Test that duplicate names are rejected on update.
     */
    it("should reject role update if new name already exists", async () => {
        const role1 = await createRole({
            name: `Role1_${Date.now()}`,
            organizationId: testOrgId,
        });
        const role2 = await createRole({
            name: `Role2_${Date.now()}`,
            organizationId: testOrgId,
        });

        await expect(
            updateRole(
                role2.id,
                {
                    name: role1.name,
                },
                testOrgId,
            ),
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
                organizationId: testOrgId,
            }),
        ).rejects.toThrow("Permission with ID");
    });

    /**
     * Test deleting a role.
     */
    it("should successfully delete a role", async () => {
        const roleToDelete = await createRole({
            name: `Role_To_Delete_${Date.now()}`,
            organizationId: testOrgId,
        });

        const deleted = await deleteRole(roleToDelete.id, testOrgId);

        expect(deleted.id).toBe(roleToDelete.id);

        await expect(getRoleById(roleToDelete.id, testOrgId)).rejects.toThrow(
            "Role not found",
        );
    });

    /**
     * Test deleting a non-existent role.
     */
    it("should throw error when deleting non-existent role", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";

        await expect(deleteRole(fakeId, testOrgId)).rejects.toThrow(
            "Role not found",
        );
    });

    /**
     * Test retrieving all permissions.
     */
    it("should successfully retrieve all permissions in one go", async () => {
        const result = await getAllPermissions();

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(3);
    });

    /**
     * Test searching permissions by name or codename.
     */
    it("should successfully search permissions by codename", async () => {
        const searchTerm = "test_create";
        const result = await getAllPermissions(searchTerm);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        result.forEach((permission) => {
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
            permissionIds: [createdPermissionIds[0]!],
            organizationId: testOrgId,
        });

        expect(role.permissions.length).toBe(1);

        const updated1 = await updateRole(
            role!.id,
            {
                permissionIds: createdPermissionIds.slice(0, 2),
            },
            testOrgId,
        );
        expect(updated1.permissions.length).toBe(2);

        const updated2 = await updateRole(
            role!.id,
            {
                permissionIds: [createdPermissionIds[2]!],
            },
            testOrgId,
        );
        expect(updated2.permissions.length).toBe(1);
        expect(updated2.permissions[0]!.id).toBe(createdPermissionIds[2]!);
    });

    /**
     * Test that permissions are properly linked to roles.
     */
    it("should maintain proper permission-role associations", async () => {
        const role = await getRoleById(createdRoleId, testOrgId);

        expect(role.permissions.length).toBeGreaterThan(0);

        for (const permission of role.permissions) {
            expect(permission.id).toBeDefined();
            expect(permission.name).toBeDefined();
            expect(permission.codename).toBeDefined();
        }
    });
});
