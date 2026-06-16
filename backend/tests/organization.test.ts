import { describe, it, expect, beforeAll } from "vitest";
import {
    registerUser,
    verifyOtp,
} from "../src/modules/users/application/user.use-cases.js";
import {
    createOrganization,
    getOrganizationById,
    getMyOrganizations,
    getAllOrganizations,
    updateOrganization,
    deleteOrganization,
} from "../src/modules/organizations/application/organization.use-cases.js";
import { fileFilter } from "../src/shared/middleware/upload.js";
import { uploadToS3 } from "../src/shared/utils/s3.js";
import { Request } from "express";

describe("Organization Flow Integration Tests", () => {
    let ownerId: string;
    let otherUserId: string;
    let createdOrgId: string;

    const uniqueTime = Date.now();
    const ownerEmail = `owner_${uniqueTime}@example.com`;
    const ownerPhone = `8888${String(uniqueTime).slice(-6)}`;
    const otherEmail = `other_${uniqueTime}@example.com`;
    const otherPhone = `7777${String(uniqueTime).slice(-6)}`;

    beforeAll(async () => {
        const ownerResult = await registerUser({
            username: "owneruser",
            email: ownerEmail,
            phoneNumber: ownerPhone,
            password: "Password@123",
        });
        await verifyOtp({
            email: ownerEmail,
            phoneNumber: ownerPhone,
            emailOtp: "123456",
            phoneOtp: "123456",
        });
        ownerId = ownerResult.id;

        const otherResult = await registerUser({
            username: "otheruser",
            email: otherEmail,
            phoneNumber: otherPhone,
            password: "Password@123",
        });
        await verifyOtp({
            email: otherEmail,
            phoneNumber: otherPhone,
            emailOtp: "123456",
            phoneOtp: "123456",
        });
        otherUserId = otherResult.id;
    });

    /**
     * Test organization creation.
     */
    it("should successfully create a new organization", async () => {
        const orgName = `Org_${Date.now()}`;
        const orgSlug = `org-${Date.now()}`;
        const org = await createOrganization(
            {
                name: orgName,
                slug: orgSlug,
                description: "Test description",
            },
            ownerId,
        );

        expect(org.id).toBeDefined();
        expect(org.name).toBe(orgName);
        expect(org.slug).toBe(orgSlug);
        expect(org.ownerUserId).toBe(ownerId);
        createdOrgId = org.id;
    });

    /**
     * Test name and slug uniqueness.
     */
    it("should reject creation if name or slug already exists", async () => {
        const orgName = `Org_${Date.now()}_unique`;
        const orgSlug = `org-${Date.now()}-unique`;

        await createOrganization(
            {
                name: orgName,
                slug: orgSlug,
            },
            ownerId,
        );

        await expect(
            createOrganization(
                {
                    name: orgName,
                    slug: `another-slug-${Date.now()}`,
                },
                ownerId,
            ),
        ).rejects.toThrow("Name already exists");

        await expect(
            createOrganization(
                {
                    name: `another-name-${Date.now()}`,
                    slug: orgSlug,
                },
                ownerId,
            ),
        ).rejects.toThrow("Slug already exists");
    });

    /**
     * Test retrieving organization by ID.
     */
    it("should fetch an organization by its id", async () => {
        const fetched = await getOrganizationById(createdOrgId);
        expect(fetched.id).toBe(createdOrgId);
        expect(fetched.ownerUserId).toBe(ownerId);
    });

    /**
     * Test retrieving organizations owned by owner.
     */
    it("should fetch all organizations owned by the user", async () => {
        const result = await getMyOrganizations(ownerId);
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.some((o) => o.id === createdOrgId)).toBe(true);
        expect(result.pagination.total).toBeGreaterThanOrEqual(1);
    });

    /**
     * Test retrieving all organizations.
     */
    it("should fetch all organizations in system", async () => {
        const result = await getAllOrganizations();
        expect(result.organizations.length).toBeGreaterThanOrEqual(1);
        expect(result.pagination.total).toBeGreaterThanOrEqual(1);
    });

    /**
     * Test updating organization details.
     */
    it("should update organization fields if requester is owner", async () => {
        const newName = `Updated_Org_${Date.now()}`;
        const updated = await updateOrganization(
            createdOrgId,
            {
                name: newName,
                description: "Updated description",
            },
            ownerId,
        );

        expect(updated.name).toBe(newName);
        expect(updated.description).toBe("Updated description");
    });

    /**
     * Test update authorization check.
     */
    it("should prevent updating organization if requester is not owner", async () => {
        await expect(
            updateOrganization(
                createdOrgId,
                {
                    name: "Unauthorized Update",
                },
                otherUserId,
            ),
        ).rejects.toThrow("You are not authorized to update this organization");
    });

    /**
     * Test deleting organization.
     */
    it("should prevent deleting organization if requester is not owner", async () => {
        await expect(
            deleteOrganization(createdOrgId, otherUserId),
        ).rejects.toThrow("You are not authorized to delete this organization");
    });

    /**
     * Test successful delete.
     */
    it("should delete organization if requester is owner", async () => {
        const deleted = await deleteOrganization(createdOrgId, ownerId);
        expect(deleted.id).toBe(createdOrgId);

        await expect(getOrganizationById(createdOrgId)).rejects.toThrow(
            "Organization not found",
        );
    });

    /**
     * Test zod schemas validation.
     */
    it("should validate zod schema constraints", async () => {
        const { createOrganizationSchema } =
            await import("../src/modules/organizations/presentation/organization.validation.js");

        const invalidResult = await createOrganizationSchema.safeParseAsync({
            body: {
                name: "a",
                slug: "Invalid Slug",
                logoUrl: "not-a-url",
            },
        });

        expect(invalidResult.success).toBe(false);
    });

    /**
     * Test pagination limits.
     */
    it("should restrict list length when limit parameter is set", async () => {
        const result = await getAllOrganizations(1, 1, undefined);
        expect(result.organizations.length).toBeLessThanOrEqual(1);
        expect(result.pagination.limit).toBe(1);
    });

    /**
     * Test search parameter filtering.
     */
    it("should return only organizations matching the search parameter", async () => {
        const specificName = `SearchableOrg_${Date.now()}`;
        const specificSlug = `searchable-org-${Date.now()}`;

        await createOrganization(
            {
                name: specificName,
                slug: specificSlug,
            },
            ownerId,
        );

        const resultAll = await getAllOrganizations(
            1,
            10,
            undefined,
            "SearchableOrg",
        );
        expect(resultAll.organizations.length).toBeGreaterThanOrEqual(1);
        expect(
            resultAll.organizations.every((org) =>
                org.name.includes("SearchableOrg"),
            ),
        ).toBe(true);

        const resultMine = await getMyOrganizations(
            ownerId,
            1,
            10,
            "SearchableOrg",
        );
        expect(resultMine.data.length).toBeGreaterThanOrEqual(1);
        expect(
            resultMine.data.every((org) => org.name.includes("SearchableOrg")),
        ).toBe(true);

        const noResult = await getAllOrganizations(
            1,
            10,
            undefined,
            "NonExistentNameStringThatWillNotMatchAnything",
        );
        expect(noResult.organizations.length).toBe(0);
        expect(noResult.pagination.total).toBe(0);
    });

    /**
     * Test uploadToS3 utility.
     */
    it("should successfully mock uploading file to S3", async () => {
        const mockFile = {
            originalname: "logo.png",
            mimetype: "image/png",
            buffer: Buffer.from("dummy-content"),
        } as Express.Multer.File;

        const { env } = await import("../src/config/env.js");
        const url = await uploadToS3(mockFile);
        expect(url).toContain(env.AWS_BUCKET_NAME);
        expect(url).toContain("logo.png");
    });

    /**
     * Test multer file filter logic.
     */
    it("should reject non-image file types", async () => {
        const mockFile = {
            mimetype: "text/plain",
            originalname: "text.txt",
        } as Express.Multer.File;

        let errorResult: Error | null = null;
        fileFilter({} as Request, mockFile, (err: Error | null) => {
            errorResult = err;
        });

        expect(errorResult).toBeDefined();
        expect((errorResult as unknown as Error).message).toContain(
            "Only image files",
        );
    });

    /**
     * Test multer file filter logic with valid types.
     */
    it("should accept valid image file types", async () => {
        const mockFile = {
            mimetype: "image/png",
            originalname: "logo.png",
        } as Express.Multer.File;

        let errorResult: Error | null = null;
        let successResult = false;
        fileFilter(
            {} as Request,
            mockFile,
            (err: Error | null, accept?: boolean) => {
                errorResult = err;
                if (accept) successResult = true;
            },
        );

        expect(errorResult).toBeNull();
        expect(successResult).toBe(true);
    });

    /**
     * Test retrieving organizations where user is owner or joined member.
     */
    it("should fetch organizations owned or joined by the user", async () => {
        // Create an organization by other user
        const otherOrg = await createOrganization(
            {
                name: `OtherOrg_${Date.now()}`,
                slug: `other-org-${Date.now()}`,
            },
            otherUserId,
        );

        // Add ownerUser as member of otherOrg
        const { createMember } =
            await import("../src/modules/organizations/infrastructure/organization-member.repository.js");
        const { createRole } =
            await import("../src/modules/roles/infrastructure/role.repository.js");

        const testRole = await createRole({
            name: `Joined_Role_${Date.now()}`,
            organizationId: otherOrg.id,
        });

        await createMember({
            organizationId: otherOrg.id,
            memberId: ownerId,
            roleId: testRole.id,
            status: "active",
        });

        // ownerId should see both the organization they own, and the one they joined
        const result = await getAllOrganizations(1, 10, ownerId);
        expect(result.organizations.some((o) => o.id === otherOrg.id)).toBe(
            true,
        );
    });
});
