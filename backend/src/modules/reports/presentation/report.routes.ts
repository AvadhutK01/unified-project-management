import { Router } from "express";
import {
    getProjectOverviewHandler,
    getSprintPerformanceHandler,
    getWorkitemAnalyticsHandler,
    getMemberActivityHandler,
    getResourceAllocationHandler,
} from "./report.controller.js";
import { validateRequest } from "../../../shared/validators/index.js";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import { requirePermission } from "../../../shared/middleware/require-permission.js";
import { reportQuerySchema } from "./report.validation.js";

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireOrgId);

// All reports require 'organization_view' permission
// Route prefix expected: /api/v1/organizations/:orgId/reports

router.get(
    "/project-overview",
    requirePermission("organization_view"),
    validateRequest(reportQuerySchema),
    getProjectOverviewHandler,
);

router.get(
    "/sprint-performance",
    requirePermission("organization_view"),
    validateRequest(reportQuerySchema),
    getSprintPerformanceHandler,
);

router.get(
    "/workitem-analytics",
    requirePermission("organization_view"),
    validateRequest(reportQuerySchema),
    getWorkitemAnalyticsHandler,
);

router.get(
    "/member-activity",
    requirePermission("organization_view"),
    validateRequest(reportQuerySchema),
    getMemberActivityHandler,
);

router.get(
    "/resource-allocation",
    requirePermission("organization_view"),
    validateRequest(reportQuerySchema),
    getResourceAllocationHandler,
);

export { router as reportRouter };
