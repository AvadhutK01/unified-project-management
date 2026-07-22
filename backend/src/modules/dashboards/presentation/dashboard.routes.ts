import { Router } from "express";
import {
    handleGetOrganizationDashboard,
    handleGetProjectDashboard,
    handleGetPhaseDashboard,
    handleGetOrganizationSummary,
    handleGetProjectSummary,
    handleGetPhaseSummary,
} from "./dashboard.controller.js";
import { validateRequest } from "../../../shared/validators/index.js";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import { requirePlan } from "../../../shared/middleware/require-premium.js";
import { requirePermission } from "../../../shared/middleware/require-permission.js";
import {
    projectDashboardParamsSchema,
    phaseDashboardParamsSchema,
} from "./dashboard.validation.js";

const router = Router();

router.use(authenticate);
router.use(requireOrgId);

router.get("/organizations", handleGetOrganizationDashboard);

router.get(
    "/projects/:projectId",
    requirePermission("project_view"),
    validateRequest(projectDashboardParamsSchema),
    handleGetProjectDashboard,
);

router.get(
    "/phases/:phaseId",
    requirePermission("phase_view"),
    validateRequest(phaseDashboardParamsSchema),
    handleGetPhaseDashboard,
);

router.get(
    "/organizations/summary",
    requirePlan("premium"),
    handleGetOrganizationSummary,
);

router.get(
    "/projects/:projectId/summary",
    requirePlan("premium"),
    requirePermission("project_view"),
    validateRequest(projectDashboardParamsSchema),
    handleGetProjectSummary,
);

router.get(
    "/phases/:phaseId/summary",
    requirePlan("premium"),
    requirePermission("phase_view"),
    validateRequest(phaseDashboardParamsSchema),
    handleGetPhaseSummary,
);

export { router as dashboardRouter };
