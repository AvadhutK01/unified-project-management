import { Router } from "express";
import {
    handleCreatePhase,
    handleGetPhaseById,
    handleGetAllPhases,
    handleUpdatePhase,
    handleDeletePhase,
} from "./phase.controller.js";
import { validateRequest } from "../../../shared/validators/index.js";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import {
    createPhaseSchema,
    updatePhaseSchema,
    phaseIdParamSchema,
    listPhasesQuerySchema,
} from "./phase.validation.js";
import { requirePermission } from "../../../shared/middleware/require-permission.js";

const router = Router();

router.use(authenticate);
router.use(requireOrgId);

router.post(
    "/",
    requirePermission("phase_add"),
    validateRequest(createPhaseSchema),
    handleCreatePhase,
);

router.get(
    "/",
    requirePermission("phase_list"),
    validateRequest(listPhasesQuerySchema),
    handleGetAllPhases,
);

router.get(
    "/:id",
    requirePermission("phase_view"),
    validateRequest(phaseIdParamSchema),
    handleGetPhaseById,
);

router.put(
    "/:id",
    requirePermission("phase_edit"),
    validateRequest(updatePhaseSchema),
    handleUpdatePhase,
);

router.delete(
    "/:id",
    requirePermission("phase_edit"),
    validateRequest(phaseIdParamSchema),
    handleDeletePhase,
);

export { router as phaseRouter };
