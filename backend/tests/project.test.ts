import { describe, it, expect, beforeAll } from "vitest";
import {
    registerUser,
    verifyOtp,
} from "../src/modules/users/application/user.use-cases.js";
import { createOrganization } from "../src/modules/organizations/application/organization.use-cases.js";
import {
    createProject,
    getProjectById,
    getAllProjects,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    getProjectMembers,
} from "../src/modules/projects/application/project.use-cases.js";
import { db } from "../src/infrastructure/database/client.js";
import {
    organizationMembers,
    roles,
} from "../src/infrastructure/database/schema/index.js";

describe("Project Flow Integration Tests", () => {
    let ownerId: string;
    let memberId1: string;
    let nonMemberId: string;
    let organizationId: string;
    let otherOrgId: string;
    let createdProjectId: string;
    let ownerOrgMemberId: string;
    let member1OrgMemberId: string;
    let nonMemberOrgMemberId: string;

    const uniqueTime = Date.now();
    const ownerEmail = `owner_proj_${uniqueTime}@example.com`;
    const ownerPhone = `8888${String(uniqueTime).slice(-6)}`;
    const memberEmail1 = `mem1_proj_${uniqueTime}@example.com`;
    const memberPhone1 = `7777${String(uniqueTime).slice(-6)}`;
    const nonMemberEmail = `nonmem_proj_${uniqueTime}@example.com`;
    const nonMemberPhone = `6666${String(uniqueTime).slice(-6)}`;

    beforeAll(async () => {
        const ownerResult = await registerUser({
            username: "owneruserproj",
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

        const memberResult1 = await registerUser({
            username: "member1",
            email: memberEmail1,
            phoneNumber: memberPhone1,
            password: "Password@123",
        });
        await verifyOtp({
            email: memberEmail1,
            phoneNumber: memberPhone1,
            emailOtp: "123456",
            phoneOtp: "123456",
        });
        memberId1 = memberResult1.id;

        const nonMemberResult = await registerUser({
            username: "nonmember",
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
                name: `Org_Proj_${Date.now()}`,
                slug: `org-proj-${Date.now()}`,
                description: "Project test organization",
            },
            ownerId,
        );
        organizationId = org.id;

        const otherOrg = await createOrganization(
            {
                name: `Org_Proj_Other_${Date.now()}`,
                slug: `org-proj-other-${Date.now()}`,
                description: "Other project test organization",
            },
            ownerId,
        );
        otherOrgId = otherOrg.id;

        const [role] = await db
            .insert(roles)
            .values({
                organizationId,
                name: "Developer",
            })
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

        const [member1Member] = await db
            .insert(organizationMembers)
            .values({
                organizationId,
                memberId: memberId1,
                roleId: role.id,
                status: "active",
            })
            .returning();
        member1OrgMemberId = member1Member.id;

        const [nonMemberMember] = await db
            .insert(organizationMembers)
            .values({
                organizationId,
                memberId: nonMemberId,
                roleId: role.id,
                status: "active",
            })
            .returning();
        nonMemberOrgMemberId = nonMemberMember.id;
    }, 30000);

    /**
     * Test project creation.
     */
    it("should successfully create a new project with members mapped", async () => {
        const project = await createProject({
            organizationId,
            title: "Test Project 1",
            description: "First test project",
            startDate: "2026-06-01",
            endDate: "2026-06-30",
            clientName: "Client A",
            logoUrl: "http://example.com/logo.png",
            status: "started",
            orgMemberIds: [member1OrgMemberId],
        });

        expect(project.id).toBeDefined();
        expect(project.title).toBe("Test Project 1");
        expect(project.organizationId).toBe(organizationId);
        expect(project.logoUrl).toBe("http://example.com/logo.png");
        expect(project.status).toBe("started");
        createdProjectId = project.id;

        const members = await getProjectMembers(
            project.id,
            organizationId,
            ownerId,
        );
        expect(members.length).toBe(1);
        expect(members[0].organizationMemberId).toBe(member1OrgMemberId);
    });

    /**
     * Test title uniqueness validation.
     */
    it("should reject project creation with a duplicate title in the same organization", async () => {
        await expect(
            createProject({
                organizationId,
                title: "Test Project 1",
            }),
        ).rejects.toThrow(
            "Project with this title already exists in this organization",
        );
    });

    /**
     * Test title uniqueness in different organizations.
     */
    it("should allow project creation with a duplicate title in a different organization", async () => {
        const project = await createProject({
            organizationId: otherOrgId,
            title: "Test Project 1",
        });
        expect(project.id).toBeDefined();
        expect(project.organizationId).toBe(otherOrgId);
    });

    /**
     * Test date validation on project creation.
     */
    it("should reject project creation if start date is after end date", async () => {
        await expect(
            createProject({
                organizationId,
                title: "Invalid Dates Project",
                startDate: "2026-06-30",
                endDate: "2026-06-01",
            }),
        ).rejects.toThrow("Start date must be before or equal to end date");
    });

    /**
     * Test project retrieval and access controls.
     */
    it("should fetch a project by its id and check access", async () => {
        const fetched = await getProjectById(
            createdProjectId,
            organizationId,
            ownerId,
        );
        expect(fetched.id).toBe(createdProjectId);
        expect(fetched.members.length).toBe(1);

        const fetchedByMember = await getProjectById(
            createdProjectId,
            organizationId,
            memberId1,
        );
        expect(fetchedByMember.id).toBe(createdProjectId);

        await expect(
            getProjectById(createdProjectId, organizationId, nonMemberId),
        ).rejects.toThrow("You do not have access to this project");
    });

    /**
     * Test fetching all projects of an organization.
     */
    it("should fetch all projects with pagination", async () => {
        const result = await getAllProjects(organizationId, 1, 10);
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.pagination.total).toBeGreaterThanOrEqual(1);
    });

    /**
     * Test organization owner vs member list restriction logic.
     */
    it("should restrict project lists to members only, while owners see all projects", async () => {
        const otherProject = await createProject({
            organizationId,
            title: "Other Project Private",
            orgMemberIds: [],
        });

        const ownerList = await getAllProjects(
            organizationId,
            1,
            10,
            undefined,
            ownerId,
        );
        expect(ownerList.data.some((p) => p.id === otherProject.id)).toBe(true);

        const memberList = await getAllProjects(
            organizationId,
            1,
            10,
            undefined,
            memberId1,
        );
        expect(memberList.data.some((p) => p.id === otherProject.id)).toBe(
            false,
        );
    }, 20000);

    /**
     * Test searching projects.
     */
    it("should return filtered projects matching search term", async () => {
        const searchResult = await getAllProjects(
            organizationId,
            1,
            10,
            "Test Project 1",
        );
        expect(searchResult.data.length).toBeGreaterThanOrEqual(1);

        const noResult = await getAllProjects(
            organizationId,
            1,
            10,
            "NonExistentProjectTitle",
        );
        expect(noResult.data.length).toBe(0);
    });

    /**
     * Test project updates including member mapping sync and access control.
     */
    it("should successfully update project details and check access control", async () => {
        await expect(
            updateProject(
                createdProjectId,
                organizationId,
                {
                    title: "Unauthorized Title Change",
                },
                nonMemberId,
            ),
        ).rejects.toThrow("You do not have access to this project");

        const updated = await updateProject(
            createdProjectId,
            organizationId,
            {
                title: "Updated Project Title",
                orgMemberIds: [ownerOrgMemberId],
            },
            ownerId,
        );

        expect(updated.title).toBe("Updated Project Title");

        const members = await getProjectMembers(
            createdProjectId,
            organizationId,
            ownerId,
        );
        expect(members.length).toBe(1);
        expect(members[0].organizationMemberId).toBe(ownerOrgMemberId);
    }, 20000);

    /**
     * Test title uniqueness validation on update.
     */
    it("should reject project update to an existing title in the same organization", async () => {
        const tempProject = await createProject({
            organizationId,
            title: "Temporary Title",
        });

        await expect(
            updateProject(
                tempProject.id,
                organizationId,
                {
                    title: "Updated Project Title",
                },
                ownerId,
            ),
        ).rejects.toThrow(
            "Project with this title already exists in this organization",
        );
    });

    /**
     * Test manual project member management and access control.
     */
    it("should manually add and remove project members and check access control", async () => {
        await expect(
            addProjectMember(
                createdProjectId,
                organizationId,
                member1OrgMemberId,
                nonMemberId,
            ),
        ).rejects.toThrow("You do not have access to this project");

        await addProjectMember(
            createdProjectId,
            organizationId,
            member1OrgMemberId,
            ownerId,
        );
        let members = await getProjectMembers(
            createdProjectId,
            organizationId,
            ownerId,
        );
        expect(members.length).toBe(2);

        await expect(
            removeProjectMember(
                createdProjectId,
                organizationId,
                member1OrgMemberId,
                nonMemberId,
            ),
        ).rejects.toThrow("You do not have access to this project");

        await removeProjectMember(
            createdProjectId,
            organizationId,
            member1OrgMemberId,
            ownerId,
        );
        members = await getProjectMembers(
            createdProjectId,
            organizationId,
            ownerId,
        );
        expect(members.length).toBe(1);
    }, 20000);

    /**
     * Test project soft deletion and access control.
     */
    it("should soft delete a project, check access, and allow reusing the title", async () => {
        const titleToReuse = "Reusable Title Project";
        const project = await createProject({
            organizationId,
            title: titleToReuse,
        });

        await expect(
            deleteProject(project.id, organizationId, nonMemberId),
        ).rejects.toThrow("You do not have access to this project");

        const deleted = await deleteProject(
            project.id,
            organizationId,
            ownerId,
        );
        expect(deleted.id).toBe(project.id);

        await expect(
            getProjectById(project.id, organizationId, ownerId),
        ).rejects.toThrow("Project not found");

        const newProject = await createProject({
            organizationId,
            title: titleToReuse,
        });
        expect(newProject.id).toBeDefined();
    }, 20000);

    /**
     * Test zod schemas validation.
     */
    it("should validate project creation zod schema", async () => {
        const { createProjectSchema } =
            await import("../src/modules/projects/presentation/project.validation.js");

        const invalidResult = await createProjectSchema.safeParseAsync({
            body: {
                title: "",
                startDate: "not-a-date",
                orgMemberIds: ["not-a-uuid"],
            },
        });

        expect(invalidResult.success).toBe(false);
    });
});
