import { Router } from "express";
import {
    handleCreateRole,
    handleGetRoleById,
    handleGetAllRoles,
    handleUpdateRole,
    handleDeleteRole,
} from "./role.controller.js";
import { handleGetAllPermissions } from "./permission.controller.js";
import { validateRequest } from "../../../shared/validators/index.js";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import { requirePermission } from "../../../shared/middleware/require-permission.js";
import {
    createRoleSchema,
    updateRoleSchema,
    roleIdParamSchema,
    paginationQuerySchema,
} from "./role.validation.js";
import { permissionQuerySchema } from "./permission.validation.js";

const router = Router();

router.use(authenticate);
router.use(requireOrgId);

router.post(
    "/",
    requirePermission("roles_add"),
    validateRequest(createRoleSchema),
    handleCreateRole,
);

router.get(
    "/",
    requirePermission("roles_list"),
    validateRequest(paginationQuerySchema),
    handleGetAllRoles,
);

router.get(
    "/:id",
    requirePermission("roles_view"),
    validateRequest(roleIdParamSchema),
    handleGetRoleById,
);

router.put(
    "/:id",
    requirePermission("roles_edit"),
    validateRequest(updateRoleSchema),
    handleUpdateRole,
);

router.delete(
    "/:id",
    requirePermission("roles_delete"),
    validateRequest(roleIdParamSchema),
    handleDeleteRole,
);

router.get(
    "/permissions/all",
    requirePermission("roles_list"),
    validateRequest(permissionQuerySchema),
    handleGetAllPermissions,
);

export { router as roleRouter };
