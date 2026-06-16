import { describe, it, expect, beforeAll } from "vitest";
import {
    registerUser,
    verifyOtp,
} from "../src/modules/users/application/user.use-cases.js";
import { createOrganization } from "../src/modules/organizations/application/organization.use-cases.js";
import { createRole } from "../src/modules/roles/application/role.use-cases.js";
import {
    inviteMembers,
    getInvitationsForUser,
    updateInvitationStatus,
    getOrganizationMembersList,
    reInviteMember,
    getMemberDetails,
    editMemberDetails,
    removeMember,
    revokeInvitation,
} from "../src/modules/organizations/application/organization-member.use-cases.js";

import { getMemberRoleData } from "../src/shared/utils/role-data.js";

describe("Organization Membership and Invitation Integration Tests", () => {
    let ownerId: string;
    let user2Id: string;
    let user2Email: string;
    let user3Id: string;
    let user3Email: string;

    let orgId: string;
    let roleId: string;
    let otherRoleId: string;

    let invitationId: string;
    let user3InvitationId: string;

    beforeAll(async () => {
        const uniqueTime = Date.now();

        // 1. Create owner user
        const ownerEmail = `owner_${uniqueTime}@example.com`;
        const ownerPhone = `5555${String(uniqueTime).slice(-6)}`;
        const owner = await registerUser({
            username: `owner_${uniqueTime}`,
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

        // 2. Create user 2 (invited and accepts)
        user2Email = `user2_${uniqueTime}@example.com`;
        const user2Phone = `4444${String(uniqueTime).slice(-6)}`;
        const user2 = await registerUser({
            username: `user2_${uniqueTime}`,
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

        // 3. Create user 3 (invited, rejects, then re-invited)
        user3Email = `user3_${uniqueTime}@example.com`;
        const user3Phone = `3333${String(uniqueTime).slice(-6)}`;
        const user3 = await registerUser({
            username: `user3_${uniqueTime}`,
            email: user3Email,
            phoneNumber: user3Phone,
            password: "Password@123",
        });
        await verifyOtp({
            email: user3Email,
            phoneNumber: user3Phone,
            emailOtp: "123456",
            phoneOtp: "123456",
        });
        user3Id = user3.id;

        // 4. Create an organization
        const org = await createOrganization(
            {
                name: `Org_Member_Test_${uniqueTime}`,
                slug: `org-member-test-${uniqueTime}`,
            },
            ownerId,
        );
        orgId = org.id;

        // 5. Create roles
        const role = await createRole({
            name: `Test_Member_Role_${uniqueTime}`,
            organizationId: orgId,
        });
        roleId = role.id;

        const otherRole = await createRole({
            name: `Test_Admin_Role_${uniqueTime}`,
            organizationId: orgId,
        });
        otherRoleId = otherRole.id;
    });

    it("should successfully invite registered users to the organization", async () => {
        const invites = await inviteMembers(orgId, ownerId, [
            { email: user2Email, roleId },
            { email: user3Email, roleId },
        ]);

        expect(invites.length).toBe(2);
        expect(invites[0].email).toBe(user2Email);
        expect(invites[0].status).toBe("pending");

        invitationId = invites[0].id;
        user3InvitationId = invites[1].id;
    });

    it("should fetch pending invitations for invited user", async () => {
        const result = await getInvitationsForUser(user2Id, 1, 10);
        expect(result.data.length).toBe(1);
        expect(result.data[0].id).toBe(invitationId);
        expect(result.data[0].status).toBe("pending");
        expect(result.data[0].roleName).toBeDefined();
        expect(result.data[0].invitedByName).toBeDefined();
        expect(result.data[0].organizationName).toBeDefined();
    });

    it("should allow a user to accept their pending invitation", async () => {
        const updated = await updateInvitationStatus(
            invitationId,
            user2Id,
            "accepted",
        );
        expect(updated.status).toBe("accepted");

        const members = await getOrganizationMembersList(
            orgId,
            "joined",
            1,
            10,
        );
        expect(members.data.length).toBe(1);
        expect(members.data[0].memberId).toBe(user2Id);
        expect(members.data[0].status).toBe("active");
    });

    it("should allow a user to reject their pending invitation", async () => {
        const updated = await updateInvitationStatus(
            user3InvitationId,
            user3Id,
            "rejected",
        );
        expect(updated.status).toBe("rejected");

        const invites = await getOrganizationMembersList(
            orgId,
            "invited",
            1,
            10,
        );
        expect(invites.data.length).toBe(1);
        expect(invites.data[0].memberId).toBe(user3Id);
        expect(invites.data[0].status).toBe("rejected");
    });

    it("should successfully re-invite a rejected member", async () => {
        const reInvited = await reInviteMember(
            orgId,
            ownerId,
            user3Email,
            otherRoleId,
        );
        expect(reInvited.status).toBe("pending");
        expect(reInvited.roleId).toBe(otherRoleId);

        const invites = await getOrganizationMembersList(
            orgId,
            "invited",
            1,
            10,
        );
        expect(invites.data.length).toBe(1);
        expect(invites.data[0].memberId).toBe(user3Id);
        expect(invites.data[0].status).toBe("pending");
    });

    it("should get member details successfully", async () => {
        const members = await getOrganizationMembersList(
            orgId,
            "joined",
            1,
            10,
        );
        const memberId = members.data[0].id;

        const details = await getMemberDetails(memberId);
        expect(details.username).toBeDefined();
        expect(details.email).toBe(user2Email);
        expect(details.status).toBe("active");
        expect(details.phoneNumber).toBeDefined();
        expect(details.roleName).toBeDefined();
    });

    it("should successfully retrieve member role and permissions details", async () => {
        const ownerRole = await getMemberRoleData(orgId, ownerId);
        expect(ownerRole).toBeDefined();
        expect(ownerRole?.is_org_owner).toBe(true);
        expect(ownerRole?.name).toBe("Owner");
        expect(ownerRole?.permissions.length).toBe(0);
        const memberRole = await getMemberRoleData(orgId, user2Id);
        expect(memberRole).toBeDefined();
        expect(memberRole?.is_org_owner).toBe(false);
        expect(memberRole?.name).toBeDefined();
        expect(memberRole?.permissions).toBeDefined();
    });

    it("should edit member role and status successfully", async () => {
        const members = await getOrganizationMembersList(
            orgId,
            "joined",
            1,
            10,
        );
        const memberId = members.data[0].id;

        const updated = await editMemberDetails(memberId, {
            roleId: otherRoleId,
            status: "onleave",
        });

        expect(updated.status).toBe("onleave");
        expect(updated.roleId).toBe(otherRoleId);

        const details = await getMemberDetails(memberId);
        expect(details.status).toBe("onleave");
    });

    it("should soft delete member successfully", async () => {
        const members = await getOrganizationMembersList(
            orgId,
            "joined",
            1,
            10,
        );
        const memberId = members.data[0].id;

        const deleted = await removeMember(memberId);
        expect(deleted.deletedAt).toBeDefined();

        await expect(getMemberDetails(memberId)).rejects.toThrow(
            "Member not found",
        );

        const updatedMembersList = await getOrganizationMembersList(
            orgId,
            "joined",
            1,
            10,
        );
        expect(updatedMembersList.data.length).toBe(0);
    });

    it("should successfully revoke a pending invitation", async () => {
        const result = await getOrganizationMembersList(
            orgId,
            "invited",
            1,
            10,
        );
        const inviteId = result.data[0].id;

        const revoked = await revokeInvitation(inviteId);
        expect(revoked.status).toBe("revoked");

        await expect(revokeInvitation(inviteId)).rejects.toThrow(
            "Invitation is not in pending state",
        );
    });

    it("should successfully search for members and invitations by search query", async () => {
        const uniqueTime = Date.now();
        const searchUserEmail = `searchuser_${uniqueTime}@example.com`;
        const searchUserPhone = `2222${String(uniqueTime).slice(-6)}`;
        const searchUser = await registerUser({
            username: `searchable_${uniqueTime}`,
            email: searchUserEmail,
            phoneNumber: searchUserPhone,
            password: "Password@123",
        });
        await verifyOtp({
            email: searchUserEmail,
            phoneNumber: searchUserPhone,
            emailOtp: "123456",
            phoneOtp: "123456",
        });

        // Invite searchUser
        await inviteMembers(orgId, ownerId, [
            { email: searchUserEmail, roleId },
        ]);

        // Search for invitations by username
        const invitedSearchResult = await getOrganizationMembersList(
            orgId,
            "invited",
            1,
            10,
            "searchable",
        );
        expect(invitedSearchResult.data.length).toBeGreaterThanOrEqual(1);
        expect(
            invitedSearchResult.data.some((i) => i.memberId === searchUser.id),
        ).toBe(true);

        // Accept invitation to make them joined
        const userInvitation = invitedSearchResult.data.find(
            (i) => i.memberId === searchUser.id,
        );
        expect(userInvitation).toBeDefined();
        await updateInvitationStatus(
            userInvitation!.id,
            searchUser.id,
            "accepted",
        );

        // Search joined members by email
        const joinedSearchResult = await getOrganizationMembersList(
            orgId,
            "joined",
            1,
            10,
            searchUserEmail,
        );
        expect(joinedSearchResult.data.length).toBeGreaterThanOrEqual(1);
        expect(
            joinedSearchResult.data.some((m) => m.memberId === searchUser.id),
        ).toBe(true);
    });
});
