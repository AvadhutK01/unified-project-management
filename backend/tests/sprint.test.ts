import { describe, it, expect, beforeAll } from "vitest";
import {
    registerUser,
    verifyOtp,
} from "../src/modules/users/application/user.use-cases.js";
import { createOrganization } from "../src/modules/organizations/application/organization.use-cases.js";
import { createProject } from "../src/modules/projects/application/project.use-cases.js";
import { createPhase } from "../src/modules/phases/application/phase.use-cases.js";
import {
    createSprint,
    getSprintById,
    getAllSprints,
    updateSprint,
    updateSprintStatus,
    deleteSprint,
    getSprintActivities,
} from "../src/modules/sprints/application/sprint.use-cases.js";
import { db } from "../src/infrastructure/database/client.js";
import {
    organizationMembers,
    roles,
} from "../src/infrastructure/database/schema/index.js";

describe("Sprint Flow Integration Tests", () => {
    let ownerId: string;
    let memberId: string;
    let nonMemberId: string;
    let organizationId: string;
    let projectId: string;
    let otherProjectId: string;
    let phaseId: string;
    let otherPhaseId: string;
    let createdSprintId: string;
    let ownerOrgMemberId: string;

    const uniqueTime = Date.now();
    const ownerEmail = `owner_sprint_${uniqueTime}@example.com`;
    const ownerPhone = `5556${String(uniqueTime).slice(-6)}`;
    const memberEmail = `mem_sprint_${uniqueTime}@example.com`;
    const memberPhone = `4445${String(uniqueTime).slice(-6)}`;
    const nonMemberEmail = `nonmem_sprint_${uniqueTime}@example.com`;
    const nonMemberPhone = `3334${String(uniqueTime).slice(-6)}`;

    beforeAll(async () => {
        const ownerResult = await registerUser({
            username: "ownersprintusr",
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

        const memberResult = await registerUser({
            username: "membersprintusr",
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

        const nonMemberResult = await registerUser({
            username: "nonmembersprintusr",
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

        const org = await createOrganization(
            {
                name: `Org_Sprint_${uniqueTime}`,
                slug: `org-sprint-${uniqueTime}`,
                description: "Sprint test organization",
            },
            ownerId,
        );
        organizationId = org.id;

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

        await db.insert(organizationMembers).values({
            organizationId,
            memberId: nonMemberId,
            roleId: role!.id,
            status: "active",
        });

        const project = await createProject({
            organizationId,
            title: `Sprint Test Project ${uniqueTime}`,
            description: "Project for sprint tests",
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            orgMemberIds: [ownerOrgMemberId],
        });
        projectId = project.id;

        const otherProject = await createProject({
            organizationId,
            title: `Sprint Other Project ${uniqueTime}`,
            orgMemberIds: [],
        });
        otherProjectId = otherProject.id;

        const phase = await createPhase({
            projectId,
            organizationId,
            userId: ownerId,
            name: "Sprint phase",
        });
        phaseId = phase.id;

        const otherPhase = await createPhase({
            projectId: otherProjectId,
            organizationId,
            userId: ownerId,
            name: "Other phase",
        });
        otherPhaseId = otherPhase.id;
    }, 60000);

    it("should create a sprint with all fields", async () => {
        const sprint = await createSprint({
            phaseId,
            organizationId,
            userId: ownerId,
            title: "Sprint One",
            description: "First sprint description",
            startDate: "2026-01-01",
            endDate: "2026-01-15",
            sequence: 1,
            acceptanceCriteria: "Must pass all tests",
            status: "new",
        });

        expect(sprint.id).toBeDefined();
        expect(sprint.phaseId).toBe(phaseId);
        expect(sprint.title).toBe("Sprint One");
        expect(sprint.description).toBe("First sprint description");
        expect(sprint.startDate).toBe("2026-01-01");
        expect(sprint.endDate).toBe("2026-01-15");
        expect(sprint.sequence).toBe(1);
        expect(sprint.acceptanceCriteria).toBe("Must pass all tests");
        expect(sprint.status).toBe("new");
        expect(sprint.deletedAt).toBeNull();

        createdSprintId = sprint.id;
    });

    it("should create a sprint with only required fields", async () => {
        const sprint = await createSprint({
            phaseId,
            organizationId,
            userId: ownerId,
            title: "Minimal Sprint",
        });

        expect(sprint.id).toBeDefined();
        expect(sprint.title).toBe("Minimal Sprint");
        expect(sprint.description).toBeNull();
        expect(sprint.startDate).toBeNull();
        expect(sprint.endDate).toBeNull();
        expect(sprint.sequence).toBeNull();
        expect(sprint.acceptanceCriteria).toBeNull();
        expect(sprint.status).toBe("new");
    });

    it("should reject sprint creation when startDate is after endDate", async () => {
        await expect(
            createSprint({
                phaseId,
                organizationId,
                userId: ownerId,
                title: "Bad Dates Sprint",
                startDate: "2026-01-15",
                endDate: "2026-01-01",
            }),
        ).rejects.toThrow("Start date must be before or equal to end date");
    });

    it("should reject sprint creation for a non-existent phase", async () => {
        await expect(
            createSprint({
                phaseId: "00000000-0000-0000-0000-000000000000",
                organizationId,
                userId: ownerId,
                title: "Ghost Sprint",
            }),
        ).rejects.toThrow("Phase not found");
    });

    it("should reject sprint creation by a user without project access", async () => {
        await expect(
            createSprint({
                phaseId,
                organizationId,
                userId: nonMemberId,
                title: "Unauthorized Sprint",
            }),
        ).rejects.toThrow("You do not have access to this project");
    });

    it("should fetch a sprint by ID for a project member", async () => {
        const sprint = await getSprintById(
            createdSprintId,
            organizationId,
            ownerId,
        );

        expect(sprint.id).toBe(createdSprintId);
        expect(sprint.title).toBe("Sprint One");
        expect(sprint.projectId).toBe(projectId);
        expect(sprint.projectTitle).toBe(`Sprint Test Project ${uniqueTime}`);
        expect(sprint.phaseId).toBe(phaseId);
        expect(sprint.phaseTitle).toBe("Sprint phase");
        expect(sprint.organizationId).toBe(organizationId);
        expect(sprint.organizationName).toBe(`Org_Sprint_${uniqueTime}`);
    });

    it("should reject getSprintById for a user without project access", async () => {
        await expect(
            getSprintById(createdSprintId, organizationId, nonMemberId),
        ).rejects.toThrow("You do not have access to this project");
    });

    it("should list all sprints for a phase with pagination", async () => {
        const result = await getAllSprints(
            phaseId,
            organizationId,
            ownerId,
            1,
            10,
        );

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.pagination.total).toBeGreaterThanOrEqual(1);
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.limit).toBe(10);
        expect(result.data.every((s) => s.phaseId === phaseId)).toBe(true);
    });

    it("should return sprints matching a search term", async () => {
        const found = await getAllSprints(
            phaseId,
            organizationId,
            ownerId,
            1,
            10,
            "Sprint One",
        );
        expect(found.data.some((s) => s.title === "Sprint One")).toBe(true);
    });

    it("should reject getAllSprints for a user without project access", async () => {
        await expect(
            getAllSprints(phaseId, organizationId, nonMemberId),
        ).rejects.toThrow("You do not have access to this project");
    });

    it("should update sprint fields", async () => {
        const updated = await updateSprint(
            createdSprintId,
            organizationId,
            ownerId,
            {
                title: "Sprint One Updated",
                description: "Updated description",
                sequence: 2,
                acceptanceCriteria: "New criteria",
            },
        );

        expect(updated.id).toBe(createdSprintId);
        expect(updated.title).toBe("Sprint One Updated");
        expect(updated.description).toBe("Updated description");
        expect(updated.sequence).toBe(2);
        expect(updated.acceptanceCriteria).toBe("New criteria");
    });

    it("should update sprint status", async () => {
        const updated = await updateSprintStatus(
            createdSprintId,
            organizationId,
            ownerId,
            "active",
        );

        expect(updated.id).toBe(createdSprintId);
        expect(updated!.status).toBe("active");
    });

    it("should retrieve activity logs for a sprint and verify automated descriptions", async () => {
        const activities = await getSprintActivities(
            createdSprintId,
            organizationId,
            ownerId,
        );

        expect(activities.data.length).toBeGreaterThanOrEqual(3);

        const statusLog = activities.data.find(
            (a) => a.action === "status_updated",
        );
        expect(statusLog).toBeDefined();
        expect(statusLog?.description).toContain(
            "Status updated from 'new' to 'active'",
        );
        expect(statusLog?.user.id).toBe(ownerId);

        const updateLog = activities.data.find((a) => a.action === "updated");
        expect(updateLog).toBeDefined();
        expect(updateLog?.description).toContain(
            "Updated title from 'Sprint One' to 'Sprint One Updated'",
        );
        expect(updateLog?.description).toContain(
            "Updated sequence from 1 to 2",
        );

        const createLog = activities.data.find((a) => a.action === "created");
        expect(createLog).toBeDefined();
        expect(createLog?.description).toBe("Sprint created");
    });

    it("should reject status update by a user without project access", async () => {
        await expect(
            updateSprintStatus(
                createdSprintId,
                organizationId,
                nonMemberId,
                "closed",
            ),
        ).rejects.toThrow("You do not have access to this project");
    });

    it("should reject delete by a user without project access", async () => {
        await expect(
            deleteSprint(createdSprintId, organizationId, nonMemberId),
        ).rejects.toThrow("You do not have access to this project");
    });

    it("should soft-delete a sprint and make it unfetchable", async () => {
        const deleted = await deleteSprint(
            createdSprintId,
            organizationId,
            ownerId,
        );
        expect(deleted.id).toBe(createdSprintId);
        expect(deleted!.deletedAt).not.toBeNull();

        await expect(
            getSprintById(createdSprintId, organizationId, ownerId),
        ).rejects.toThrow("Sprint not found");
    }, 60000);

    it("should reject createSprintSchema with missing required fields", async () => {
        const { createSprintSchema } =
            await import("../src/modules/sprints/presentation/sprint.validation.js");

        const result = await createSprintSchema.safeParseAsync({
            body: {
                description: "Missing title and phaseId",
            },
        });

        expect(result.success).toBe(false);
    });

    it("should reject createSprintSchema when startDate >= endDate", async () => {
        const { createSprintSchema } =
            await import("../src/modules/sprints/presentation/sprint.validation.js");

        const result = await createSprintSchema.safeParseAsync({
            body: {
                phaseId: "00000000-0000-0000-0000-000000000001",
                title: "Test Sprint",
                startDate: "2026-06-30",
                endDate: "2026-06-01",
            },
        });

        expect(result.success).toBe(false);
    });
});
