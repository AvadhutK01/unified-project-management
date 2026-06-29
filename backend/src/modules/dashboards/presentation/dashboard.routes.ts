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
    validateRequest(projectDashboardParamsSchema),
    handleGetProjectDashboard,
);

router.get(
    "/phases/:phaseId",
    validateRequest(phaseDashboardParamsSchema),
    handleGetPhaseDashboard,
);

router.get("/organizations/summary", handleGetOrganizationSummary);

router.get(
    "/projects/:projectId/summary",
    validateRequest(projectDashboardParamsSchema),
    handleGetProjectSummary,
);

router.get(
    "/phases/:phaseId/summary",
    validateRequest(phaseDashboardParamsSchema),
    handleGetPhaseSummary,
);

export { router as dashboardRouter };
