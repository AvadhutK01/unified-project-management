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
    createWorkitemDiscussion,
    updateWorkitemDiscussion,
    getWorkitemDiscussions,
    deleteWorkitemDiscussion,
} from "../src/modules/workitems/application/workitem-discussion.use-cases.js";
import { db } from "../src/infrastructure/database/client.js";
import {
    organizationMembers,
    roles,
} from "../src/infrastructure/database/schema/index.js";
import { findMemberByOrgAndUserId } from "../src/modules/organizations/infrastructure/organization-member.repository.js";

describe("Workitem Discussion Integration Tests", () => {
    let ownerId: string;
    let user2Id: string;
    let user2Email: string;
    let orgId: string;
    let roleId: string;
    let workitemId: string;
    let ownerOrgMemberId: string;
    let user2OrgMemberId: string;
    let commentId: string;

    beforeAll(async () => {
        const uniqueTime = Date.now();

        // 1. Create owner user
        const ownerEmail = `owner_w_discussion_${uniqueTime}@example.com`;
        const ownerPhone = `9999${String(uniqueTime).slice(-6)}`;
        const owner = await registerUser({
            username: `owner_w_disc_${uniqueTime}`,
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

        // 2. Create user2
        user2Email = `user2_w_discussion_${uniqueTime}@example.com`;
        const user2Phone = `8888${String(uniqueTime).slice(-6)}`;
        const user2 = await registerUser({
            username: `user2_w_disc_${uniqueTime}`,
            email: user2Email,
            phoneNumber: user2Phone,
            password: "Password@123",
        });
        await verifyOtp({
            email: user2Email,
            phoneNumber: user2Phone,
            emailOtp: "123456",
            phoneOtp: "123456",
        });
        user2Id = user2.id;

        // 3. Create organization
        const org = await createOrganization(
            {
                name: `Org_W_Discussion_Test_${uniqueTime}`,
                slug: `org-w-discussion-test-${uniqueTime}`,
            },
            ownerId,
        );
        orgId = org.id;

        // 4. Create role
        const role = await db
            .insert(roles)
            .values({
                organizationId: orgId,
                name: "Developer",
            })
            .returning();
        roleId = role[0].id;

        // 5. Get existing owner member (created by createOrganization)
        const ownerMember = await findMemberByOrgAndUserId(orgId, ownerId);
        ownerOrgMemberId = ownerMember!.id;

        const [user2Member] = await db
            .insert(organizationMembers)
            .values({
                organizationId: orgId,
                memberId: user2Id,
                roleId: roleId,
                status: "active",
            })
            .returning();
        user2OrgMemberId = user2Member.id;

        // 6. Create project, phase, sprint and workitem
        const project = await createProject({
            organizationId: orgId,
            title: `W_Discussion_Proj_${uniqueTime}`,
            orgMemberIds: [ownerOrgMemberId, user2OrgMemberId],
        });

        const phase = await createPhase({
            projectId: project.id,
            organizationId: orgId,
            userId: ownerId,
            name: "Phase 1",
        });

        const sprint = await createSprint({
            phaseId: phase.id,
            organizationId: orgId,
            userId: ownerId,
            title: "Sprint 1",
            status: "new",
        });

        const workitem = await createWorkitem({
            sprintId: sprint.id,
            organizationId: orgId,
            userId: ownerId,
            title: "Workitem 1",
            workitemType: "task",
        });
        workitemId = workitem.id;
    }, 40000);

    it("should successfully create a workitem discussion comment and tag user2", async () => {
        const commentText =
            "Hello team, let's look at this workitem requirement!";
        const result = await createWorkitemDiscussion(
            workitemId,
            ownerId,
            orgId,
            commentText,
            [user2OrgMemberId],
        );

        expect(result.id).toBeDefined();
        expect(result.comment).toBe(commentText);
        expect(result.memberId).toBe(ownerOrgMemberId);
        expect(result.tags.length).toBe(1);
        expect(result.tags[0].memberId).toBe(user2OrgMemberId);

        commentId = result.id;
    });

    it("should reject discussion comment creation if a tagged member does not belong to the organization", async () => {
        await expect(
            createWorkitemDiscussion(
                workitemId,
                ownerId,
                orgId,
                "Invalid comment tags",
                ["00000000-0000-0000-0000-000000000000"],
            ),
        ).rejects.toThrow("does not belong to this organization");
    });

    it("should fetch a paginated list of discussions including author details and tags", async () => {
        const list = await getWorkitemDiscussions(workitemId, orgId, 1, 10);

        expect(list.data.length).toBe(1);
        expect(list.data[0].id).toBe(commentId);
        expect(list.data[0].comment).toBe(
            "Hello team, let's look at this workitem requirement!",
        );
        expect(list.data[0].authorName).toBeDefined();
        expect(list.data[0].authorEmail).toBeDefined();
        expect(list.data[0].taggedMembers.length).toBe(1);
        expect(list.data[0].taggedMembers[0].memberId).toBe(user2OrgMemberId);
        expect(list.data[0].taggedMembers[0].email).toBe(user2Email);
    });

    it("should successfully update discussion comment text and tagging", async () => {
        const updatedText = "Updated requirement comment!";
        const result = await updateWorkitemDiscussion(
            commentId,
            ownerId,
            orgId,
            updatedText,
            [], // Clear tags
        );

        expect(result.comment).toBe(updatedText);
        expect(result.tags.length).toBe(0);

        const list = await getWorkitemDiscussions(workitemId, orgId, 1, 10);
        expect(list.data[0].comment).toBe(updatedText);
        expect(list.data[0].taggedMembers.length).toBe(0);
    });

    it("should block update attempt by a user who is not the author", async () => {
        await expect(
            updateWorkitemDiscussion(
                commentId,
                user2Id,
                orgId,
                "Hack update attempt",
            ),
        ).rejects.toThrow(
            "You are not authorized to update this discussion comment",
        );
    });

    it("should block delete attempt by a user who is not the author", async () => {
        await expect(
            deleteWorkitemDiscussion(commentId, user2Id, orgId),
        ).rejects.toThrow(
            "You are not authorized to delete this discussion comment",
        );
    });

    it("should successfully delete a discussion comment", async () => {
        const deleted = await deleteWorkitemDiscussion(
            commentId,
            ownerId,
            orgId,
        );
        expect(deleted.deletedAt).toBeDefined();

        const list = await getWorkitemDiscussions(workitemId, orgId, 1, 10);
        expect(list.data.length).toBe(0);
    });
});
