import { Router } from "express";
import {
    handleCreateProject,
    handleGetProjectById,
    handleGetAllProjects,
    handleUpdateProject,
    handleDeleteProject,
    handleAddProjectMember,
    handleRemoveProjectMember,
    handleGetProjectMembers,
} from "./project.controller.js";
import { validateRequest } from "../../../shared/validators/index.js";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import {
    createProjectSchema,
    updateProjectSchema,
    projectIdParamSchema,
    projectMemberSchema,
    projectMemberParamSchema,
} from "./project.validation.js";
import { uploadImage } from "../../../shared/middleware/upload.js";
import { requirePermission } from "../../../shared/middleware/require-permission.js";

const router = Router();

router.use(authenticate);
router.use(requireOrgId);

router.post(
    "/",
    requirePermission("project_add"),
    uploadImage.single("logo"),
    validateRequest(createProjectSchema),
    handleCreateProject,
);

router.get("/", requirePermission("project_list"), handleGetAllProjects);

router.get(
    "/:id",
    requirePermission("project_view"),
    validateRequest(projectIdParamSchema),
    handleGetProjectById,
);

router.put(
    "/:id",
    requirePermission("project_edit"),
    uploadImage.single("logo"),
    validateRequest(updateProjectSchema),
    handleUpdateProject,
);

router.delete(
    "/:id",
    requirePermission("project_delete"),
    validateRequest(projectIdParamSchema),
    handleDeleteProject,
);

router.post(
    "/:id/members",
    requirePermission("project_edit"),
    validateRequest(projectMemberSchema),
    handleAddProjectMember,
);

router.get(
    "/:id/members",
    requirePermission("project_view"),
    validateRequest(projectIdParamSchema),
    handleGetProjectMembers,
);

router.delete(
    "/:id/members/:orgMemberId",
    requirePermission("project_edit"),
    validateRequest(projectMemberParamSchema),
    handleRemoveProjectMember,
);

export { router as projectRouter };
