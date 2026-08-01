import { describe, it, expect, beforeAll } from "vitest";
import {
    registerUser,
    verifyOtp,
} from "../src/modules/users/application/user.use-cases.js";
import { createOrganization } from "../src/modules/organizations/application/organization.use-cases.js";
import { createProject } from "../src/modules/projects/application/project.use-cases.js";
import { createPhase } from "../src/modules/phases/application/phase.use-cases.js";
import { createSprint } from "../src/modules/sprints/application/sprint.use-cases.js";
import { createWorkitem } from "../src/modules/workitems/application/workitem.use-cases.js";
import {
    getOrganizationDashboard,
    getProjectDashboard,
    getPhaseDashboard,
} from "../src/modules/dashboards/application/dashboard.use-cases.js";
import { db } from "../src/infrastructure/database/client.js";
import {
    organizationMembers,
    roles,
} from "../src/infrastructure/database/schema/index.js";

describe("Dashboard Flow Integration Tests", () => {
    let ownerId: string;
    let organizationId: string;
    let projectId: string;
    let phaseId: string;
    let sprintId: string;
    let ownerOrgMemberId: string;

    const uniqueTime = Date.now();
    const ownerEmail = `owner_dash_${uniqueTime}@example.com`;
    const ownerPhone = `5551${String(uniqueTime).slice(-6)}`;

    beforeAll(async () => {
        const ownerResult = await registerUser({
            username: "ownerdashusr",
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

        const org = await createOrganization(
            {
                name: `Org_Dash_${uniqueTime}`,
                slug: `org-dash-${uniqueTime}`,
                description: "Dashboard test organization",
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

        const project = await createProject({
            organizationId,
            title: `Dash Test Project ${uniqueTime}`,
            description: "Project for dashboard tests",
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            orgMemberIds: [ownerOrgMemberId],
        });
        projectId = project.id;

        const phase = await createPhase({
            projectId,
            organizationId,
            userId: ownerId,
            name: "Dash phase",
        });
        phaseId = phase.id;

        const sprint = await createSprint({
            phaseId,
            organizationId,
            userId: ownerId,
            title: "Dash Sprint One",
            status: "active",
        });
        sprintId = sprint.id;

        // Note: workitems require projectMembers.
        // For dashboard purposes, the counts are mostly on phase/sprint/workitem tables.
        // We might need to map the member to a project member if we wanted to assign, but assignment is optional.
        await createWorkitem({
            sprintId,
            organizationId,
            userId: ownerId,
            title: "Dash Task 1",
            workitemType: "task",
            status: "new",
            originalEstimation: 10,
        });

        await createWorkitem({
            sprintId,
            organizationId,
            userId: ownerId,
            title: "Dash Task 2",
            workitemType: "task",
            status: "closed",
            originalEstimation: 5,
            completed: 5,
        });
    }, 60000);

    it("should retrieve organization dashboard metrics correctly", async () => {
        const data = await getOrganizationDashboard(organizationId, ownerId);

        expect(data).toBeDefined();
        // Repository returns a flat shape: { title, slug, totalProjectsCount, ... }
        expect(data.title).toBeDefined();
        expect(data.totalProjectsCount).toBe(1);
        expect(data.totalMembersCount).toBeGreaterThanOrEqual(1);
        expect(data.projects.length).toBe(1);
    });

    it("should retrieve project dashboard metrics correctly", async () => {
        const data = await getProjectDashboard(projectId);

        expect(data).toBeDefined();
        // Repository returns a flat shape: { title, totalPhasesCount, phases, ... }
        expect(data.title).toBeDefined();
        expect(data.totalPhasesCount).toBe(1);
        expect(data.phases.length).toBe(1);
    });

    it("should retrieve phase dashboard metrics correctly", async () => {
        const data = await getPhaseDashboard(phaseId);

        expect(data).toBeDefined();
        // Repository returns a flat shape: { title, totalSprintsCount, sprints, ... }
        expect(data.title).toBeDefined();
        expect(data.totalSprintsCount).toBe(1);
        expect(data.sprints.length).toBe(1);
        expect(data.activeSprintsCount).toBe(1); // We created it as active
    });

    it("should throw not found error for invalid ids", async () => {
        const invalidId = "00000000-0000-0000-0000-000000000000";
        await expect(
            getOrganizationDashboard(invalidId, ownerId),
        ).rejects.toThrow("Organization not found");
        await expect(getProjectDashboard(invalidId)).rejects.toThrow(
            "Project not found",
        );
        await expect(getPhaseDashboard(invalidId)).rejects.toThrow(
            "Phase not found",
        );
    });

    it("should retrieve project dashboard AI summary", async () => {
        const { getProjectDashboardSummary } =
            await import("../src/modules/dashboards/application/dashboard.use-cases.js");
        const summary = await getProjectDashboardSummary(projectId);

        expect(summary).toBeDefined();
        expect(typeof summary).toBe("string");
    });
});
