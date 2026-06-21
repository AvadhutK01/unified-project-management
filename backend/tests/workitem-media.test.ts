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
    uploadWorkitemMedia,
    getWorkitemMediaList,
    deleteWorkitemMedia,
} from "../src/modules/workitems/application/workitem-media.use-cases.js";
import { db } from "../src/infrastructure/database/client.js";
import {
    organizationMembers,
    roles,
} from "../src/infrastructure/database/schema/index.js";
import { findMemberByOrgAndUserId } from "../src/modules/organizations/infrastructure/organization-member.repository.js";
import { Readable } from "stream";

describe("Workitem Media Integration Tests", () => {
    let ownerId: string;
    let user2Id: string;
    let orgId: string;
    let roleId: string;
    let workitemId: string;
    let ownerOrgMemberId: string;
    let user2OrgMemberId: string;
    let mediaId: string;

    beforeAll(async () => {
        const uniqueTime = Date.now();

        // 1. Create owner user
        const ownerEmail = `owner_w_media_${uniqueTime}@example.com`;
        const ownerPhone = `9998${String(uniqueTime).slice(-6)}`;
        const owner = await registerUser({
            username: `owner_w_med_${uniqueTime}`,
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
        const user2Email = `user2_w_media_${uniqueTime}@example.com`;
        const user2Phone = `8887${String(uniqueTime).slice(-6)}`;
        const user2 = await registerUser({
            username: `user2_w_med_${uniqueTime}`,
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
                name: `Org_W_Media_Test_${uniqueTime}`,
                slug: `org-w-media-test-${uniqueTime}`,
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
            title: `W_Media_Proj_${uniqueTime}`,
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

    it("should successfully upload a workitem media file", async () => {
        // Create mock multer file
        const mockFile: Express.Multer.File = {
            fieldname: "file",
            originalname: "workitem_design.pdf",
            encoding: "7bit",
            mimetype: "application/pdf",
            buffer: Buffer.from("mock content"),
            size: 12,
            stream: new Readable(),
            destination: "",
            filename: "",
            path: "",
        };

        const result = await uploadWorkitemMedia(
            workitemId,
            ownerId,
            orgId,
            mockFile,
        );

        expect(result.id).toBeDefined();
        expect(result.name).toBe("workitem_design.pdf");
        expect(result.fileType).toBe("application/pdf");
        expect(result.fileSize).toBe(12);
        expect(result.url).toContain("workitems/");

        mediaId = result.id;
    });

    it("should fetch a paginated list of workitem media attachments", async () => {
        const list = await getWorkitemMediaList(workitemId, orgId, 1, 10);

        expect(list.data.length).toBe(1);
        expect(list.data[0].id).toBe(mediaId);
        expect(list.data[0].name).toBe("workitem_design.pdf");
        expect(list.data[0].uploaderName).toBeDefined();
        expect(list.data[0].uploaderEmail).toBeDefined();
    });

    it("should return correct matches on search query", async () => {
        const searchMatch = await getWorkitemMediaList(
            workitemId,
            orgId,
            1,
            10,
            "design",
        );
        expect(searchMatch.data.length).toBe(1);

        const searchNoMatch = await getWorkitemMediaList(
            workitemId,
            orgId,
            1,
            10,
            "nonexistent",
        );
        expect(searchNoMatch.data.length).toBe(0);
    });

    it("should block delete attempt by a user who is not the uploader", async () => {
        await expect(
            deleteWorkitemMedia(mediaId, user2Id, orgId),
        ).rejects.toThrow(
            "You are not authorized to delete this media attachment",
        );
    });

    it("should successfully delete a workitem media attachment", async () => {
        const deleted = await deleteWorkitemMedia(mediaId, ownerId, orgId);
        expect(deleted.deletedAt).toBeDefined();

        const list = await getWorkitemMediaList(workitemId, orgId, 1, 10);
        expect(list.data.length).toBe(0);
    });
});
