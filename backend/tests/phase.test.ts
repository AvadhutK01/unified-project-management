import { describe, it, expect, beforeAll } from "vitest";
import {
    registerUser,
    verifyOtp,
} from "../src/modules/users/application/user.use-cases.js";
import { createOrganization } from "../src/modules/organizations/application/organization.use-cases.js";
import { createProject } from "../src/modules/projects/application/project.use-cases.js";
import {
    createPhase,
    getPhaseById,
    getAllPhases,
    updatePhase,
    deletePhase,
} from "../src/modules/phases/application/phase.use-cases.js";
import { db } from "../src/infrastructure/database/client.js";
import {
    organizationMembers,
    roles,
} from "../src/infrastructure/database/schema/index.js";

describe("Phase Flow Integration Tests", () => {
    let ownerId: string;
    let memberId: string;
    let nonMemberId: string;
    let organizationId: string;
    let projectId: string;
    let otherProjectId: string;
    let createdPhaseId: string;
    let ownerOrgMemberId: string;

    const uniqueTime = Date.now();
    const ownerEmail = `owner_phase_${uniqueTime}@example.com`;
    const ownerPhone = `5555${String(uniqueTime).slice(-6)}`;
    const memberEmail = `mem_phase_${uniqueTime}@example.com`;
    const memberPhone = `4444${String(uniqueTime).slice(-6)}`;
    const nonMemberEmail = `nonmem_phase_${uniqueTime}@example.com`;
    const nonMemberPhone = `3333${String(uniqueTime).slice(-6)}`;

    beforeAll(async () => {
        // Register owner
        const ownerResult = await registerUser({
            username: "ownerphaseusr",
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

        // Register member
        const memberResult = await registerUser({
            username: "memberphaseusr",
            email: memberEmail,
            phoneNumber: memberPhone,
            password: "Password@123",
        });
        await verifyOtp({
            email: memberEmail,
            phoneNumber: memberPhone,
            emailOtp: "123456",
            phoneOtp: "123456",
        });
        memberId = memberResult.id;

        // Register non-member
        const nonMemberResult = await registerUser({
            username: "nonmemberphaseusr",
            email: nonMemberEmail,
            phoneNumber: nonMemberPhone,
            password: "Password@123",
        });
        await verifyOtp({
            email: nonMemberEmail,
            phoneNumber: nonMemberPhone,
            emailOtp: "123456",
            phoneOtp: "123456",
        });
        nonMemberId = nonMemberResult.id;

        // Create organization
        const org = await createOrganization(
            {
                name: `Org_Phase_${uniqueTime}`,
                slug: `org-phase-${uniqueTime}`,
                description: "Phase test organization",
            },
            ownerId,
        );
        organizationId = org.id;

        // Seed org members
        const [role] = await db
            .insert(roles)
            .values({ organizationId, name: "Dev" })
            .returning();

        const allOrgMembersForOwner = await db
            .select()
            .from(organizationMembers);
        ownerOrgMemberId = allOrgMembersForOwner.find(
            (m) => m.memberId === ownerId,
        )!.id;

        await db.insert(organizationMembers).values({
            organizationId,
            memberId: memberId,
            roleId: role!.id,
            status: "active",
        });

        // Create a project the owner and member both have access to
        const project = await createProject({
            organizationId,
            title: `Phase Test Project ${uniqueTime}`,
            description: "Project for phase tests",
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            orgMemberIds: [ownerOrgMemberId],
        });
        projectId = project.id;

        // Create a second project (owner-only) to test cross-project access control
        const otherProject = await createProject({
            organizationId,
            title: `Phase Other Project ${uniqueTime}`,
            orgMemberIds: [],
        });
        otherProjectId = otherProject.id;
    }, 30000);

    // ─── CREATE ────────────────────────────────────────────────────────────────

    /**
     * Happy path: full payload with all optional fields.
     */
    it("should create a phase with all fields", async () => {
        const phase = await createPhase({
            projectId,
            organizationId,
            userId: ownerId,
            name: "Phase One",
            description: "First phase",
            type: "development",
            status: "notstarted",
            startDate: "2026-01-01",
            endDate: "2026-03-31",
        });

        expect(phase.id).toBeDefined();
        expect(phase.projectId).toBe(projectId);
        expect(phase.name).toBe("Phase One");
        expect(phase.description).toBe("First phase");
        expect(phase.type).toBe("development");
        expect(phase.status).toBe("notstarted");
        expect(phase.startDate).toBe("2026-01-01");
        expect(phase.endDate).toBe("2026-03-31");
        expect(phase.deletedAt).toBeNull();

        createdPhaseId = phase.id;
    });

    /**
     * Happy path: minimal payload — only required fields.
     */
    it("should create a phase with only required fields", async () => {
        const phase = await createPhase({
            projectId,
            organizationId,
            userId: ownerId,
            name: "Minimal Phase",
        });

        expect(phase.id).toBeDefined();
        expect(phase.name).toBe("Minimal Phase");
        expect(phase.description).toBeNull();
        expect(phase.type).toBeNull();
        expect(phase.status).toBe("notstarted");
        expect(phase.startDate).toBeNull();
        expect(phase.endDate).toBeNull();
    });

    /**
     * Date validation: startDate must be before endDate.
     */
    it("should reject phase creation when startDate is after endDate", async () => {
        await expect(
            createPhase({
                projectId,
                organizationId,
                userId: ownerId,
                name: "Bad Dates Phase",
                startDate: "2026-06-30",
                endDate: "2026-06-01",
            }),
        ).rejects.toThrow("Start date must be before or equal to end date");
    });

    /**
     * Equal dates should be accepted (same day start=end).
     */
    it("should allow phase creation when startDate equals endDate", async () => {
        const phase = await createPhase({
            projectId,
            organizationId,
            userId: ownerId,
            name: "Same Day Phase",
            startDate: "2026-04-01",
            endDate: "2026-04-01",
        });
        expect(phase.id).toBeDefined();
        expect(phase.startDate).toBe("2026-04-01");
        expect(phase.endDate).toBe("2026-04-01");
    });

    /**
     * Project not found.
     */
    it("should reject phase creation for a non-existent project", async () => {
        await expect(
            createPhase({
                projectId: "00000000-0000-0000-0000-000000000000",
                organizationId,
                userId: ownerId,
                name: "Ghost Phase",
            }),
        ).rejects.toThrow("Project not found");
    });

    /**
     * Access control: non-member of the project cannot create a phase.
     */
    it("should reject phase creation by a user without project access", async () => {
        await expect(
            createPhase({
                projectId,
                organizationId,
                userId: nonMemberId,
                name: "Unauthorized Phase",
            }),
        ).rejects.toThrow("You do not have access to this project");
    });

    // ─── GET BY ID ─────────────────────────────────────────────────────────────

    /**
     * Happy path: owner can fetch the phase.
     */
    it("should fetch a phase by ID for a project member", async () => {
        const phase = await getPhaseById(
            createdPhaseId,
            organizationId,
            ownerId,
        );

        expect(phase.id).toBe(createdPhaseId);
        expect(phase.name).toBe("Phase One");
    });

    /**
     * Non-member cannot view the phase.
     */
    it("should reject getPhaseById for a user without project access", async () => {
        await expect(
            getPhaseById(createdPhaseId, organizationId, nonMemberId),
        ).rejects.toThrow("You do not have access to this project");
    });

    /**
     * Non-existent phase ID returns not found.
     */
    it("should throw not found for a non-existent phase ID", async () => {
        await expect(
            getPhaseById(
                "00000000-0000-0000-0000-000000000000",
                organizationId,
                ownerId,
            ),
        ).rejects.toThrow("Phase not found");
    });

    // ─── LIST ──────────────────────────────────────────────────────────────────

    /**
     * Happy path: list phases with default pagination.
     */
    it("should list all phases for a project with pagination", async () => {
        const result = await getAllPhases(
            projectId,
            organizationId,
            ownerId,
            1,
            10,
        );

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.pagination.total).toBeGreaterThanOrEqual(1);
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.limit).toBe(10);
        expect(result.pagination.totalPages).toBeGreaterThanOrEqual(1);
        expect(result.data.every((p) => p.projectId === projectId)).toBe(true);
    });

    /**
     * Search filter.
     */
    it("should return phases matching a search term", async () => {
        const found = await getAllPhases(
            projectId,
            organizationId,
            ownerId,
            1,
            10,
            "Phase One",
        );
        expect(found.data.some((p) => p.name === "Phase One")).toBe(true);

        const notFound = await getAllPhases(
            projectId,
            organizationId,
            ownerId,
            1,
            10,
            "NonExistentPhaseXYZ",
        );
        expect(notFound.data.length).toBe(0);
        expect(notFound.pagination.total).toBe(0);
    });

    /**
     * Pagination correctness: page 2 with limit 1.
     */
    it("should correctly paginate phases", async () => {
        // Ensure at least 2 phases exist on the project
        const page1 = await getAllPhases(
            projectId,
            organizationId,
            ownerId,
            1,
            1,
        );
        const page2 = await getAllPhases(
            projectId,
            organizationId,
            ownerId,
            2,
            1,
        );

        expect(page1.data.length).toBe(1);
        expect(page2.data.length).toBeGreaterThanOrEqual(0);

        if (page2.data.length > 0) {
            expect(page1.data[0]!.id).not.toBe(page2.data[0]!.id);
        }
    });

    /**
     * Access control: non-member cannot list phases.
     */
    it("should reject getAllPhases for a user without project access", async () => {
        await expect(
            getAllPhases(projectId, organizationId, nonMemberId),
        ).rejects.toThrow("You do not have access to this project");
    });

    /**
     * Project not found in list.
     */
    it("should throw not found when listing phases for a non-existent project", async () => {
        await expect(
            getAllPhases(
                "00000000-0000-0000-0000-000000000000",
                organizationId,
                ownerId,
            ),
        ).rejects.toThrow("Project not found");
    });

    // ─── UPDATE ────────────────────────────────────────────────────────────────

    /**
     * Happy path: update several fields.
     */
    it("should update phase name, description, type, and status", async () => {
        const updated = await updatePhase(
            createdPhaseId,
            organizationId,
            ownerId,
            {
                name: "Phase One Updated",
                description: "Updated description",
                type: "testing",
                status: "started",
            },
        );

        expect(updated.id).toBe(createdPhaseId);
        expect(updated.name).toBe("Phase One Updated");
        expect(updated.description).toBe("Updated description");
        expect(updated.type).toBe("testing");
        expect(updated!.status).toBe("started");
    });

    /**
     * Update dates: valid new date range.
     */
    it("should update phase dates with a valid range", async () => {
        const updated = await updatePhase(
            createdPhaseId,
            organizationId,
            ownerId,
            {
                startDate: "2026-02-01",
                endDate: "2026-05-31",
            },
        );
        expect(updated.startDate).toBe("2026-02-01");
        expect(updated.endDate).toBe("2026-05-31");
    });

    /**
     * Date validation: update endDate to before existing startDate.
     */
    it("should reject update when new endDate is before existing startDate", async () => {
        await expect(
            updatePhase(createdPhaseId, organizationId, ownerId, {
                endDate: "2026-01-01", // phase startDate is "2026-02-01"
            }),
        ).rejects.toThrow("Start date must be before or equal to end date");
    });

    /**
     * Date validation: update startDate to after existing endDate.
     */
    it("should reject update when new startDate is after existing endDate", async () => {
        await expect(
            updatePhase(createdPhaseId, organizationId, ownerId, {
                startDate: "2026-12-31", // phase endDate is "2026-05-31"
            }),
        ).rejects.toThrow("Start date must be before or equal to end date");
    });

    /**
     * Access control: non-member cannot update phase.
     */
    it("should reject update by a user without project access", async () => {
        await expect(
            updatePhase(createdPhaseId, organizationId, nonMemberId, {
                name: "Unauthorized Update",
            }),
        ).rejects.toThrow("You do not have access to this project");
    });

    /**
     * Non-existent phase update returns not found.
     */
    it("should throw not found when updating a non-existent phase", async () => {
        await expect(
            updatePhase(
                "00000000-0000-0000-0000-000000000000",
                organizationId,
                ownerId,
                { name: "Ghost Update" },
            ),
        ).rejects.toThrow("Phase not found");
    });

    /**
     * Nullable fields: clear description, type, and dates.
     */
    it("should allow clearing nullable fields on update", async () => {
        const updated = await updatePhase(
            createdPhaseId,
            organizationId,
            ownerId,
            {
                description: null,
                type: null,
                startDate: null,
                endDate: null,
            },
        );
        expect(updated.description).toBeNull();
        expect(updated.type).toBeNull();
        expect(updated.startDate).toBeNull();
        expect(updated.endDate).toBeNull();
    });

    // ─── DELETE ────────────────────────────────────────────────────────────────

    /**
     * Access control: non-member cannot delete.
     */
    it("should reject soft-delete by a user without project access", async () => {
        await expect(
            deletePhase(createdPhaseId, organizationId, nonMemberId),
        ).rejects.toThrow("You do not have access to this project");
    });

    /**
     * Happy path: soft-delete and verify phase is gone.
     */
    it("should soft-delete a phase and make it unfetchable", async () => {
        const deleted = await deletePhase(
            createdPhaseId,
            organizationId,
            ownerId,
        );
        expect(deleted.id).toBe(createdPhaseId);
        expect(deleted!.deletedAt).not.toBeNull();

        await expect(
            getPhaseById(createdPhaseId, organizationId, ownerId),
        ).rejects.toThrow("Phase not found");
    });

    /**
     * Deleted phase should not appear in list results.
     */
    it("should exclude soft-deleted phases from the list", async () => {
        const result = await getAllPhases(
            projectId,
            organizationId,
            ownerId,
            1,
            100,
        );
        expect(result.data.every((p) => p.id !== createdPhaseId)).toBe(true);
    });

    /**
     * Cannot delete an already-deleted phase.
     */
    it("should throw not found when deleting an already-deleted phase", async () => {
        await expect(
            deletePhase(createdPhaseId, organizationId, ownerId),
        ).rejects.toThrow("Phase not found");
    });

    // ─── ZOD SCHEMA VALIDATION ─────────────────────────────────────────────────

    /**
     * createPhaseSchema: missing required fields.
     */
    it("should reject createPhaseSchema with missing required fields", async () => {
        const { createPhaseSchema } =
            await import("../src/modules/phases/presentation/phase.validation.js");

        const result = await createPhaseSchema.safeParseAsync({
            body: {
                // missing projectId and name
                description: "No name no project",
            },
        });

        expect(result.success).toBe(false);
    });

    /**
     * createPhaseSchema: invalid date format.
     */
    it("should reject createPhaseSchema with invalid date formats", async () => {
        const { createPhaseSchema } =
            await import("../src/modules/phases/presentation/phase.validation.js");

        const result = await createPhaseSchema.safeParseAsync({
            body: {
                projectId: "00000000-0000-0000-0000-000000000001",
                name: "Test Phase",
                startDate: "01-01-2026", // wrong format
                endDate: "not-a-date",
            },
        });

        expect(result.success).toBe(false);
    });

    /**
     * createPhaseSchema: startDate >= endDate fails refine.
     */
    it("should reject createPhaseSchema when startDate is not before endDate", async () => {
        const { createPhaseSchema } =
            await import("../src/modules/phases/presentation/phase.validation.js");

        const result = await createPhaseSchema.safeParseAsync({
            body: {
                projectId: "00000000-0000-0000-0000-000000000001",
                name: "Test Phase",
                startDate: "2026-06-30",
                endDate: "2026-06-01",
            },
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            const paths = result.error.issues.map((i) => i.path.join("."));
            expect(paths).toContain("startDate");
            expect(paths).toContain("endDate");
        }
    });

    /**
     * createPhaseSchema: valid payload passes.
     */
    it("should accept a valid createPhaseSchema payload", async () => {
        const { createPhaseSchema } =
            await import("../src/modules/phases/presentation/phase.validation.js");

        const result = await createPhaseSchema.safeParseAsync({
            body: {
                projectId: "00000000-0000-0000-0000-000000000001",
                name: "Valid Phase",
                description: "All good",
                type: "design",
                status: "notstarted",
                startDate: "2026-01-01",
                endDate: "2026-03-31",
            },
        });

        expect(result.success).toBe(true);
    });

    /**
     * updatePhaseSchema: invalid UUID in params.
     */
    it("should reject updatePhaseSchema with invalid param UUID", async () => {
        const { updatePhaseSchema } =
            await import("../src/modules/phases/presentation/phase.validation.js");

        const result = await updatePhaseSchema.safeParseAsync({
            params: { id: "not-a-uuid" },
            body: { name: "Updated" },
        });

        expect(result.success).toBe(false);
    });

    /**
     * updatePhaseSchema: startDate after endDate fails both refines.
     */
    it("should reject updatePhaseSchema when startDate >= endDate", async () => {
        const { updatePhaseSchema } =
            await import("../src/modules/phases/presentation/phase.validation.js");

        const result = await updatePhaseSchema.safeParseAsync({
            params: { id: "00000000-0000-0000-0000-000000000001" },
            body: {
                startDate: "2026-12-31",
                endDate: "2026-01-01",
            },
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            const paths = result.error.issues.map((i) => i.path.join("."));
            expect(paths).toContain("startDate");
            expect(paths).toContain("endDate");
        }
    });

    /**
     * listPhasesQuerySchema: missing projectId.
     */
    it("should reject listPhasesQuerySchema when projectId is missing", async () => {
        const { listPhasesQuerySchema } =
            await import("../src/modules/phases/presentation/phase.validation.js");

        const result = await listPhasesQuerySchema.safeParseAsync({
            query: { page: "1", limit: "10" },
        });

        expect(result.success).toBe(false);
    });

    /**
     * listPhasesQuerySchema: valid query.
     */
    it("should accept a valid listPhasesQuerySchema payload", async () => {
        const { listPhasesQuerySchema } =
            await import("../src/modules/phases/presentation/phase.validation.js");

        const result = await listPhasesQuerySchema.safeParseAsync({
            query: {
                projectId: "00000000-0000-0000-0000-000000000001",
                page: "2",
                limit: "5",
                search: "alpha",
            },
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.query.page).toBe(2);
            expect(result.data.query.limit).toBe(5);
        }
    });
});
