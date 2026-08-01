import { Request, Response, NextFunction } from "express";
import { forbiddenError, unauthorizedError } from "../errors/app-error.js";
import { findOrganizationById } from "../../modules/organizations/infrastructure/organization.repository.js";
import { findMemberByOrgAndUserId } from "../../modules/organizations/infrastructure/organization-member.repository.js";
import { findPermissionsByRoleId } from "../../modules/roles/infrastructure/role.repository.js";

/**
 * Middleware to check if the current user has the required permission for the organization.
 * Org owner is granted all permissions automatically.
 * @param permissionCodename Codename of the required permission (e.g., 'roles_list')
 */
export const requirePermission = (permissionCodename: string) => {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user?.id;
            const orgId = req.orgId;

            if (!userId) {
                next(unauthorizedError("User is not authenticated"));
                return;
            }

            if (!orgId) {
                next(forbiddenError("Organization context is required"));
                return;
            }

            const org = await findOrganizationById(orgId);
            if (!org) {
                next(forbiddenError("Organization not found"));
                return;
            }

            if (org.ownerUserId === userId) {
                next();
                return;
            }

            const member = await findMemberByOrgAndUserId(orgId, userId);
            if (!member) {
                next(
                    forbiddenError("You are not a member of this organization"),
                );
                return;
            }

            if (member.status !== "active" && member.status !== "onleave") {
                next(forbiddenError("Your membership is not active"));
                return;
            }

            const permissions = await findPermissionsByRoleId(member.roleId);
            const hasPermission = permissions.some(
                (perm) => perm.codename === permissionCodename && perm.isActive,
            );

            if (!hasPermission) {
                next(
                    forbiddenError(
                        "You do not have permission to perform this action",
                    ),
                );
                return;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
