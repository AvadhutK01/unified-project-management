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
        const data = await getOrganizationDashboard(organizationId);

        expect(data).toBeDefined();
        expect(data.organization.id).toBe(organizationId);
        expect(data.metrics.totalProjects).toBe(1);
        expect(data.metrics.projectsByStatus.notstarted).toBe(1); // default status
        expect(data.recentProjects.length).toBe(1);
        expect(data.recentProjects[0].id).toBe(projectId);
    });

    it("should retrieve project dashboard metrics correctly", async () => {
        const data = await getProjectDashboard(projectId);

        expect(data).toBeDefined();
        expect(data.project.id).toBe(projectId);
        expect(data.metrics.totalPhases).toBe(1);
        expect(data.metrics.phasesByStatus.notstarted).toBe(1);
        expect(data.metrics.workitemsSummary.total).toBe(2);
        expect(data.metrics.workitemsSummary.completed).toBe(1); // Task 2 is resolved
        expect(data.metrics.workitemsSummary.active).toBe(1); // Task 1 is new
        expect(data.metrics.workitemsSummary.completionPercentage).toBe(50);
        expect(data.phasesOverview.length).toBe(1);
    });

    it("should retrieve phase dashboard metrics correctly", async () => {
        const data = await getPhaseDashboard(phaseId);

        expect(data).toBeDefined();
        expect(data.phase.id).toBe(phaseId);
        expect(data.metrics.totalSprints).toBe(1);
        expect(data.metrics.sprintsByStatus.active).toBe(1); // We created it as active
        expect(data.metrics.workitemsByStatus.new).toBe(1);
        expect(data.metrics.workitemsByStatus.closed).toBe(1);
        expect(data.metrics.effortSummary.totalOriginalEstimation).toBe(15);
        expect(data.metrics.effortSummary.totalCompleted).toBe(5);
        expect(data.activeSprints.length).toBe(1);
    });

    it("should throw not found error for invalid ids", async () => {
        const invalidId = "00000000-0000-0000-0000-000000000000";
        await expect(getOrganizationDashboard(invalidId)).rejects.toThrow(
            "Organization not found",
        );
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
