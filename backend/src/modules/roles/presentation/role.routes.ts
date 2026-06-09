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
import {
    createRoleSchema,
    updateRoleSchema,
    roleIdParamSchema,
    paginationQuerySchema,
} from "./role.validation.js";
import { permissionPaginationQuerySchema } from "./permission.validation.js";

const router = Router();

router.use(authenticate);

router.post("/", validateRequest(createRoleSchema), handleCreateRole);

router.get("/", validateRequest(paginationQuerySchema), handleGetAllRoles);

router.get("/:id", validateRequest(roleIdParamSchema), handleGetRoleById);

router.put("/:id", validateRequest(updateRoleSchema), handleUpdateRole);

router.delete("/:id", validateRequest(roleIdParamSchema), handleDeleteRole);

router.get(
    "/permissions/all",
    validateRequest(permissionPaginationQuerySchema),
    handleGetAllPermissions,
);

export { router as roleRouter };
