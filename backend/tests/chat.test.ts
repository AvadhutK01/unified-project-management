import { describe, it, expect, beforeAll } from "vitest";
import { getDeepOrganizationContext } from "../src/modules/chat/application/chat.use-cases.js";
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
    roles,
} from "../src/infrastructure/database/schema/index.js";

describe("Chatbot Deep Context Integration Tests", () => {
    let ownerId: string;
    let organizationId: string;
    let projectId: string;
    let phaseId: string;
    let sprintId: string;
    let ownerOrgMemberId: string;

    const uniqueTime = Date.now();
    const ownerEmail = `owner_chat_${uniqueTime}@example.com`;
    const ownerPhone = `5551${String(uniqueTime).slice(-6)}`;

    beforeAll(async () => {
        const ownerResult = await registerUser({
            username: "ownerchatusr",
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
                name: `Org_Chat_${uniqueTime}`,
                slug: `org-chat-${uniqueTime}`,
                description: "Chat test organization",
            },
            ownerId,
        );
        organizationId = org.id;

        await db
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
            title: `Chat Test Project ${uniqueTime}`,
            description: "Project for chat tests",
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            orgMemberIds: [ownerOrgMemberId],
        });
        projectId = project.id;

        const phase = await createPhase({
            projectId,
            organizationId,
            userId: ownerId,
            name: "Chat phase",
        });
        phaseId = phase.id;

        const sprint = await createSprint({
            phaseId,
            organizationId,
            userId: ownerId,
            title: "Chat Sprint One",
            status: "active",
        });
        sprintId = sprint.id;

        await createWorkitem({
            sprintId,
            organizationId,
            userId: ownerId,
            title: "Chat Task 1",
            workitemType: "task",
            status: "new",
            originalEstimation: 10,
        });

        await createWorkitem({
            sprintId,
            organizationId,
            userId: ownerId,
            title: "Chat Task 2",
            workitemType: "task",
            status: "closed",
            originalEstimation: 5,
            completed: 5,
        });
    }, 60000);

    it("should retrieve deep organization context successfully", async () => {
        const context = await getDeepOrganizationContext(organizationId);

        expect(context).toBeDefined();
        expect(context.organization).toBeDefined();
        expect(context.organization.id).toBe(organizationId);

        expect(context.projects).toBeDefined();
        expect(context.projects.length).toBe(1);
        expect(context.projects[0].id).toBe(projectId);

        const project = context.projects[0];
        expect(project.phases).toBeDefined();
        expect(project.phases.length).toBe(1);
        expect(project.phases[0].id).toBe(phaseId);

        const phase = project.phases[0];
        expect(phase.sprints).toBeDefined();
        expect(phase.sprints.length).toBe(1);
        expect(phase.sprints[0].id).toBe(sprintId);

        const sprint = phase.sprints[0];
        expect(sprint.workitems).toBeDefined();
        expect(sprint.workitems.length).toBe(2);

        const titles = sprint.workitems.map((w) => w.title);
        expect(titles).toContain("Chat Task 1");
        expect(titles).toContain("Chat Task 2");
    });

    it("should throw not found error for invalid organization id", async () => {
        const invalidId = "00000000-0000-0000-0000-000000000000";
        await expect(getDeepOrganizationContext(invalidId)).rejects.toThrow(
            "Organization not found",
        );
    });
});
