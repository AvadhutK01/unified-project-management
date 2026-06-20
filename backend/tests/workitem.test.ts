import { describe, it, expect, beforeAll } from "vitest";
import {
    registerUser,
    verifyOtp,
} from "../src/modules/users/application/user.use-cases.js";
import { createOrganization } from "../src/modules/organizations/application/organization.use-cases.js";
import { createProject } from "../src/modules/projects/application/project.use-cases.js";
import { createPhase } from "../src/modules/phases/application/phase.use-cases.js";
import { createSprint } from "../src/modules/sprints/application/sprint.use-cases.js";
import {
    createWorkitem,
    getWorkitemById,
    getAllWorkitems,
    updateWorkitem,
    updateWorkitemStatus,
    deleteWorkitem,
    getWorkitemActivities,
} from "../src/modules/workitems/application/workitem.use-cases.js";
import { db } from "../src/infrastructure/database/client.js";
import {
    organizationMembers,
    roles,
} from "../src/infrastructure/database/schema/index.js";

describe("Workitem Flow Integration Tests", () => {
    let ownerId: string;
    let memberId: string;
    let nonMemberId: string;
    let organizationId: string;
    let projectId: string;
    let phaseId: string;
    let sprintId: string;
    let createdWorkitemId: string;
    let ownerOrgMemberId: string;

    const uniqueTime = Date.now();
    const ownerEmail = `owner_wi_${uniqueTime}@example.com`;
    const ownerPhone = `1555${String(uniqueTime).slice(-6)}`;
    const memberEmail = `mem_wi_${uniqueTime}@example.com`;
    const memberPhone = `1444${String(uniqueTime).slice(-6)}`;
    const nonMemberEmail = `nonmem_wi_${uniqueTime}@example.com`;
    const nonMemberPhone = `1333${String(uniqueTime).slice(-6)}`;

    beforeAll(async () => {
        const ownerResult = await registerUser({
            username: "ownerwiusr",
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
            username: "memberwiusr",
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
            username: "nonmemberwiusr",
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
                name: `Org_WI_${uniqueTime}`,
                slug: `org-wi-${uniqueTime}`,
                description: "WI test organization",
            },
            ownerId,
        );
        organizationId = org.id;

        const [role] = await db
            .insert(roles)
            .values({ organizationId, name: "Dev" })
            .returning();

        const [ownerMember] = await db
            .insert(organizationMembers)
            .values({
                organizationId,
                memberId: ownerId,
                roleId: role.id,
                status: "active",
            })
            .returning();
        ownerOrgMemberId = ownerMember.id;

        await db.insert(organizationMembers).values({
            organizationId,
            memberId: memberId,
            roleId: role.id,
            status: "active",
        });

        await db.insert(organizationMembers).values({
            organizationId,
            memberId: nonMemberId,
            roleId: role.id,
            status: "active",
        });

        const project = await createProject({
            organizationId,
            title: `WI Test Project ${uniqueTime}`,
            description: "Project for WI tests",
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            orgMemberIds: [ownerOrgMemberId],
        });
        projectId = project.id;

        const phase = await createPhase({
            projectId,
            organizationId,
            userId: ownerId,
            name: "WI phase",
        });
        phaseId = phase.id;

        const sprint = await createSprint({
            phaseId,
            organizationId,
            userId: ownerId,
            title: "WI Sprint",
        });
        sprintId = sprint.id;
    }, 60000);

    it("should create a workitem", async () => {
        const workitem = await createWorkitem({
            sprintId,
            organizationId,
            userId: ownerId,
            title: "Test Task",
            description: "Task description",
            workitemType: "task",
            priority: 3,
        });

        expect(workitem.id).toBeDefined();
        expect(workitem.sprintId).toBe(sprintId);
        expect(workitem.title).toBe("Test Task");
        expect(workitem.workitemType).toBe("task");
        expect(workitem.status).toBe("new");
        expect(workitem.priority).toBe(3);

        createdWorkitemId = workitem.id;
    });

    it("should reject workitem creation with invalid status for task", async () => {
        await expect(
            createWorkitem({
                sprintId,
                organizationId,
                userId: ownerId,
                title: "Invalid Task",
                workitemType: "task",
                status: "resolved",
            }),
        ).rejects.toThrow("Task workitems cannot have a 'resolved' status.");
    });

    it("should fetch a workitem by ID", async () => {
        const workitem = await getWorkitemById(
            createdWorkitemId,
            organizationId,
            ownerId,
        );

        expect(workitem.id).toBe(createdWorkitemId);
        expect(workitem.title).toBe("Test Task");
    });

    it("should list all workitems for a sprint", async () => {
        const result = await getAllWorkitems(
            sprintId,
            organizationId,
            ownerId,
            1,
            10,
        );

        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.every((w) => w.sprintId === sprintId)).toBe(true);
    });

    it("should update a workitem", async () => {
        const updated = await updateWorkitem(
            createdWorkitemId,
            organizationId,
            ownerId,
            {
                title: "Updated Task",
                priority: 1,
            },
        );

        expect(updated.id).toBe(createdWorkitemId);
        expect(updated.title).toBe("Updated Task");
        expect(updated.priority).toBe(1);
    });

    it("should update workitem status", async () => {
        const updated = await updateWorkitemStatus(
            createdWorkitemId,
            organizationId,
            ownerId,
            "active",
        );

        expect(updated.id).toBe(createdWorkitemId);
        expect(updated.status).toBe("active");
    });

    it("should prevent updating task status to resolved", async () => {
        await expect(
            updateWorkitemStatus(
                createdWorkitemId,
                organizationId,
                ownerId,
                "resolved",
            ),
        ).rejects.toThrow("Task workitems cannot have a 'resolved' status.");
    });

    it("should fetch activity logs", async () => {
        const activities = await getWorkitemActivities(
            createdWorkitemId,
            organizationId,
            ownerId,
            1,
            10,
        );

        expect(activities.data.length).toBeGreaterThanOrEqual(2);
        const statusLog = activities.data.find(
            (a) => a.action === "status_updated",
        );
        expect(statusLog).toBeDefined();
        expect(statusLog?.description).toContain(
            "Status updated from 'new' to 'active'",
        );
    });

    it("should delete a workitem", async () => {
        const deleted = await deleteWorkitem(
            createdWorkitemId,
            organizationId,
            ownerId,
        );

        expect(deleted.id).toBe(createdWorkitemId);
        expect(deleted.deletedAt).not.toBeNull();
    });
});
