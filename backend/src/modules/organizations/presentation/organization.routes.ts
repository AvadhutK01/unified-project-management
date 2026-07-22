import { Router } from "express";
import {
    handleCreateOrganization,
    handleGetOrganizationById,
    handleGetMyOrganizations,
    handleGetAllOrganizations,
    handleUpdateOrganization,
    handleDeleteOrganization,
} from "./organization.controller.js";
import { validateRequest } from "../../../shared/validators/index.js";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import {
    createOrganizationSchema,
    updateOrganizationSchema,
    organizationIdParamSchema,
    paginationQuerySchema,
} from "./organization.validation.js";
import {
    handleInviteMembers,
    handleGetInvitations,
    handleUpdateInvitationStatus,
    handleGetOrganizationMembers,
    handleReInviteMember,
    handleGetMyMemberRole,
    handleGetMemberDetails,
    handleEditMemberDetails,
    handleDeleteMember,
    handleRevokeInvitation,
    handleGetProjectMembersPaginated,
    handleToggleMyLeaveStatus,
} from "./organization-member.controller.js";
import {
    inviteMembersSchema,
    updateInvitationStatusSchema,
    organizationMembersQuerySchema,
    reInviteMemberSchema,
    getMemberDetailsSchema,
    editMemberDetailsSchema,
    deleteMemberSchema,
    revokeInvitationSchema,
    projectMembersQuerySchema,
} from "./organization-member.validation.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import { requirePermission } from "../../../shared/middleware/require-permission.js";

import { uploadImage } from "../../../shared/middleware/upload.js";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    uploadImage.single("logo"),
    validateRequest(createOrganizationSchema),
    handleCreateOrganization,
);
router.get(
    "/",
    validateRequest(paginationQuerySchema),
    handleGetAllOrganizations,
);
router.get(
    "/mine",
    validateRequest(paginationQuerySchema),
    handleGetMyOrganizations,
);

router.post(
    "/members/invite",
    requireOrgId,
    requirePermission("members_invited_add"),
    validateRequest(inviteMembersSchema),
    handleInviteMembers,
);

router.get(
    "/invitations",
    validateRequest(paginationQuerySchema),
    handleGetInvitations,
);

router.put(
    "/invitations/:id/status",
    validateRequest(updateInvitationStatusSchema),
    handleUpdateInvitationStatus,
);

router.delete(
    "/invitations/:id",
    requireOrgId,
    requirePermission("members_invited_delete"),
    validateRequest(revokeInvitationSchema),
    handleRevokeInvitation,
);

router.get(
    "/members",
    requireOrgId,
    (req, res, next) => {
        const type = req.query["type"] as string;
        const requiredPermission =
            type === "invited" ? "members_invited_list" : "members_joined_list";
        return requirePermission(requiredPermission)(req, res, next);
    },
    validateRequest(organizationMembersQuerySchema),
    handleGetOrganizationMembers,
);

router.get(
    "/members/project/:projectId",
    requireOrgId,
    requirePermission("members_joined_list"),
    validateRequest(projectMembersQuerySchema),
    handleGetProjectMembersPaginated,
);

router.post(
    "/members/re-invite",
    requireOrgId,
    requirePermission("members_invited_add"),
    validateRequest(reInviteMemberSchema),
    handleReInviteMember,
);

router.get("/members/me/role", requireOrgId, handleGetMyMemberRole);

router.patch(
    "/members/me/toggle-leave",
    requireOrgId,
    handleToggleMyLeaveStatus,
);

router.get(
    "/members/:id",
    requireOrgId,
    requirePermission("members_joined_view"),
    validateRequest(getMemberDetailsSchema),
    handleGetMemberDetails,
);

router.put(
    "/members/:id",
    requireOrgId,
    requirePermission("members_joined_edit"),
    validateRequest(editMemberDetailsSchema),
    handleEditMemberDetails,
);

router.delete(
    "/members/:id",
    requireOrgId,
    requirePermission("members_joined_delete"),
    validateRequest(deleteMemberSchema),
    handleDeleteMember,
);

router.get(
    "/:id",
    validateRequest(organizationIdParamSchema),
    handleGetOrganizationById,
);
router.put(
    "/:id",
    uploadImage.single("logo"),
    validateRequest(updateOrganizationSchema),
    handleUpdateOrganization,
);
router.delete(
    "/:id",
    validateRequest(organizationIdParamSchema),
    handleDeleteOrganization,
);

export { router as organizationRouter };
