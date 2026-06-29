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
import { db } from "../src/infrastructure/database/client.js";
import {
    organizationMembers,
    projectMembers,
} from "../src/infrastructure/database/schema/index.js";
import { eq } from "drizzle-orm";
import {
    generateProjectOverviewReport,
    generateSprintPerformanceReport,
    generateMemberActivityReport,
    generatePhaseOverviewReport,
} from "../src/modules/reports/application/report.use-cases.js";

describe("Reports Module Integration Tests", () => {
    let ownerId: string;
    let orgId: string;

    beforeAll(async () => {
        const uniqueTime = Date.now();

        const ownerEmail = `owner_reports_${uniqueTime}@example.com`;
        const ownerPhone = `9999${String(uniqueTime).slice(-6)}`;
        const owner = await registerUser({
            username: `owner_reports_${uniqueTime}`,
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
        ownerId = owner.id;

        const org = await createOrganization(
            {
                name: `Org_Reports_Test_${uniqueTime}`,
                slug: `org-reports-test-${uniqueTime}`,
            },
            ownerId,
        );
        orgId = org.id;

        const allOrgMembers = await db
            .select()
            .from(organizationMembers)
            .where(eq(organizationMembers.memberId, ownerId));
        const ownerOrgMemberId = allOrgMembers[0]!.id;

        const project = await createProject({
            organizationId: orgId,
            title: `Reports_Proj_${uniqueTime}`,
            orgMemberIds: [ownerOrgMemberId],
            startDate: new Date(Date.now() - 86400000)
                .toISOString()
                .split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
        });

        const phase = await createPhase({
            projectId: project.id,
            organizationId: orgId,
            userId: ownerId,
            name: "Phase 1",
            startDate: new Date(Date.now() - 86400000)
                .toISOString()
                .split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
        });

        const sprint = await createSprint({
            phaseId: phase.id,
            organizationId: orgId,
            userId: ownerId,
            title: "Sprint 1",
            status: "new",
            startDate: new Date(Date.now() - 86400000)
                .toISOString()
                .split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
        });

        const allProjMembers = await db
            .select()
            .from(projectMembers)
            .where(eq(projectMembers.projectId, project.id));
        const projMemberId = allProjMembers[0]!.id;

        await createWorkitem({
            sprintId: sprint.id,
            organizationId: orgId,
            userId: ownerId,
            title: "Workitem 1",
            workitemType: "task",
            assignedTo: projMemberId,
        });
    }, 40000);

    const getReportDateRange = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30); // 30 days ago
        return {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        };
    };

    it("should successfully fetch project overview report", async () => {
        const { startDate, endDate } = getReportDateRange();
        const data = await generateProjectOverviewReport(
            orgId,
            startDate,
            endDate,
        );

        expect(data.length).toBeGreaterThanOrEqual(1);
        expect(data[0]!.phaseCount).toBeGreaterThanOrEqual(1);
    });

    it("should successfully fetch sprint performance report", async () => {
        const { startDate, endDate } = getReportDateRange();
        const data = await generateSprintPerformanceReport(
            orgId,
            startDate,
            endDate,
        );

        expect(data.length).toBeGreaterThanOrEqual(1);
        expect(data[0]!.totalWorkitems).toBeGreaterThanOrEqual(0);
        expect(data[0]!.statusCounts).toBeDefined();
    });

    it("should successfully fetch member activity report", async () => {
        const { startDate, endDate } = getReportDateRange();
        const data = await generateMemberActivityReport(
            orgId,
            startDate,
            endDate,
        );

        expect(data.length).toBeGreaterThanOrEqual(1);
        expect(data[0]!.memberName).toBeDefined();
        expect(data[0]!.totalWorkitems).toBeGreaterThanOrEqual(1);
    });

    it("should successfully fetch phase overview report", async () => {
        const { startDate, endDate } = getReportDateRange();
        const data = await generatePhaseOverviewReport(
            orgId,
            startDate,
            endDate,
        );
        expect(data.length).toBeGreaterThanOrEqual(1);
    });
});
