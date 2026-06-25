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
    createSprintDiscussion,
    updateSprintDiscussion,
    getSprintDiscussions,
    deleteSprintDiscussion,
} from "../src/modules/sprints/application/sprint-discussion.use-cases.js";
import { db } from "../src/infrastructure/database/client.js";
import {
    organizationMembers,
    roles,
} from "../src/infrastructure/database/schema/index.js";

describe("Sprint Discussion Integration Tests", () => {
    let ownerId: string;
    let user2Id: string;
    let user2Email: string;
    let orgId: string;
    let roleId: string;
    let sprintId: string;
    let ownerOrgMemberId: string;
    let user2OrgMemberId: string;
    let commentId: string;

    beforeAll(async () => {
        const uniqueTime = Date.now();

        // 1. Create owner user
        const ownerEmail = `owner_discussion_${uniqueTime}@example.com`;
        const ownerPhone = `9999${String(uniqueTime).slice(-6)}`;
        const owner = await registerUser({
            username: `owner_disc_${uniqueTime}`,
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
        user2Email = `user2_discussion_${uniqueTime}@example.com`;
        const user2Phone = `8888${String(uniqueTime).slice(-6)}`;
        const user2 = await registerUser({
            username: `user2_disc_${uniqueTime}`,
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
                name: `Org_Discussion_Test_${uniqueTime}`,
                slug: `org-discussion-test-${uniqueTime}`,
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
        roleId = role[0]!.id;

        // 5. Create organization members
        const [ownerMember] = await db
            .insert(organizationMembers)
            .values({
                organizationId: orgId,
                memberId: ownerId,
                roleId: roleId,
                status: "active",
            })
            .returning();
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
        user2OrgMemberId = user2Member!.id;

        // 6. Create project, phase and sprint
        const project = await createProject({
            organizationId: orgId,
            title: `Discussion_Proj_${uniqueTime}`,
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
        sprintId = sprint.id;
    }, 40000);

    it("should successfully create a sprint discussion comment and tag user2", async () => {
        const commentText =
            "Hello team, let's look at this sprint requirement!";
        const result = await createSprintDiscussion(
            sprintId,
            ownerId,
            orgId,
            commentText,
            [user2OrgMemberId],
        );

        expect(result!.id).toBeDefined();
        expect(result!.comment).toBe(commentText);
        expect(result!.memberId).toBe(ownerOrgMemberId);
        expect(result!.tags.length).toBe(1);
        expect(result!.tags[0]!.organizationMemberId).toBe(user2OrgMemberId);

        commentId = result!.id;
    });

    it("should reject discussion comment creation if a tagged member does not belong to the organization", async () => {
        await expect(
            createSprintDiscussion(
                sprintId,
                ownerId,
                orgId,
                "Invalid comment tags",
                ["00000000-0000-0000-0000-000000000000"],
            ),
        ).rejects.toThrow("does not belong to this organization");
    });

    it("should fetch a paginated list of discussions including author details and tags", async () => {
        const list = await getSprintDiscussions(sprintId, orgId, 1, 10);

        expect(list.data.length).toBe(1);
        expect(list.data[0]!!.id).toBe(commentId);
        expect(list.data[0]!!.comment).toBe(
            "Hello team, let's look at this sprint requirement!",
        );
        expect(list.data[0]!!.authorName).toBeDefined();
        expect(list.data[0]!!.authorEmail).toBeDefined();
        expect(list.data[0]!!.taggedMembers.length).toBe(1);
        expect(list.data[0]!!.taggedMembers[0]!.memberId).toBe(
            user2OrgMemberId,
        );
        expect(list.data[0]!!.taggedMembers[0]!.email).toBe(user2Email);
    });

    it("should successfully update discussion comment text and tagging", async () => {
        const updatedText = "Updated requirement comment!";
        const result = await updateSprintDiscussion(
            commentId,
            ownerId,
            orgId,
            updatedText,
            [], // Clear tags
        );

        expect(result!.comment).toBe(updatedText);
        expect(result!.tags.length).toBe(0);

        const list = await getSprintDiscussions(sprintId, orgId, 1, 10);
        expect(list.data[0]!!.comment).toBe(updatedText);
        expect(list.data[0]!!.taggedMembers.length).toBe(0);
    });

    it("should block update attempt by a user who is not the author", async () => {
        await expect(
            updateSprintDiscussion(
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
            deleteSprintDiscussion(commentId, user2Id, orgId),
        ).rejects.toThrow(
            "You are not authorized to delete this discussion comment",
        );
    });

    it("should successfully delete a discussion comment", async () => {
        const deleted = await deleteSprintDiscussion(commentId, ownerId, orgId);
        expect(deleted!.deletedAt).toBeDefined();

        const list = await getSprintDiscussions(sprintId, orgId, 1, 10);
        expect(list.data.length).toBe(0);
    });
});
