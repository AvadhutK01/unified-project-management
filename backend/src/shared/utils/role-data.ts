import { findOrganizationById } from "../../modules/organizations/infrastructure/organization.repository.js";
import { findMemberByOrgAndUserId } from "../../modules/organizations/infrastructure/organization-member.repository.js";
import {
    findRoleByIdRaw,
    findPermissionsByRoleId,
} from "../../modules/roles/infrastructure/role.repository.js";

export const getMemberRoleData = async (orgId: string, userId: string) => {
    const org = await findOrganizationById(orgId);
    if (!org) {
        return null;
    }

    if (org.ownerUserId === userId) {
        return {
            id: null,
            name: "Owner",
            permissions: [],
            is_org_owner: true,
        };
    }

    const member = await findMemberByOrgAndUserId(orgId, userId);
    if (!member) {
        return null;
    }

    const role = await findRoleByIdRaw(member.roleId);
    if (!role) {
        return {
            id: member.roleId,
            name: "Unknown",
            permissions: [],
            is_org_owner: false,
        };
    }

    const permissions = await findPermissionsByRoleId(member.roleId);

    return {
        id: role.id,
        name: role.name,
        permissions,
        is_org_owner: false,
    };
};
