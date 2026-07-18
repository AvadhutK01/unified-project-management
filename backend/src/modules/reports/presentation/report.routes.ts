import { Router } from "express";
import {
    getProjectOverviewHandler,
    getSprintPerformanceHandler,
    getMemberActivityHandler,
    getPhaseOverviewHandler,
} from "./report.controller.js";
import { validateRequest } from "../../../shared/validators/index.js";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import { requirePermission } from "../../../shared/middleware/require-permission.js";
import { reportQuerySchema } from "./report.validation.js";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireOrgId);

router.get(
    "/project-overview",
    requirePermission("report_view"),
    validateRequest(reportQuerySchema),
    getProjectOverviewHandler,
);

router.get(
    "/sprint-performance",
    requirePermission("report_view"),
    validateRequest(reportQuerySchema),
    getSprintPerformanceHandler,
);

router.get(
    "/member-activity",
    requirePermission("report_view"),
    validateRequest(reportQuerySchema),
    getMemberActivityHandler,
);

router.get(
    "/phase-overview",
    requirePermission("report_view"),
    validateRequest(reportQuerySchema),
    getPhaseOverviewHandler,
);

export { router as reportRouter };
