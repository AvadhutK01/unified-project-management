import { Router } from "express";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import { validateRequest } from "../../../shared/validators/index.js";
import { uploadMedia } from "../../../shared/middleware/upload.js";
import { requirePermission } from "../../../shared/middleware/require-permission.js";
import {
    handleCreateWorkitem,
    handleGetWorkitemById,
    handleGetAllWorkitems,
    handleUpdateWorkitem,
    handleUpdateWorkitemStatus,
    handleDeleteWorkitem,
    handleCreateWorkitemDiscussion,
    handleUpdateWorkitemDiscussion,
    handleGetWorkitemDiscussions,
    handleDeleteWorkitemDiscussion,
    handleGetWorkitemActivities,
    handleUploadWorkitemMedia,
    handleGetWorkitemMediaList,
    handleDeleteWorkitemMedia,
} from "./workitem.controller.js";
import {
    createWorkitemSchema,
    updateWorkitemSchema,
    updateWorkitemStatusSchema,
    getWorkitemsQuerySchema,
    workitemIdParamSchema,
    createWorkitemDiscussionSchema,
    updateWorkitemDiscussionSchema,
    workitemDiscussionIdParamSchema,
    workitemDiscussionsQuerySchema,
    workitemActivitiesQuerySchema,
    workitemMediaQuerySchema,
    workitemMediaIdParamSchema,
} from "./workitem.validation.js";

const router = Router();

router.use(authenticate);
router.use(requireOrgId);

router.post(
    "/",
    requirePermission("workitem_add"),
    validateRequest(createWorkitemSchema),
    handleCreateWorkitem,
);

router.get(
    "/",
    requirePermission("workitem_list"),
    validateRequest(getWorkitemsQuerySchema),
    handleGetAllWorkitems,
);

router.get(
    "/:id",
    requirePermission("workitem_view"),
    validateRequest(workitemIdParamSchema),
    handleGetWorkitemById,
);

router.put(
    "/:id",
    requirePermission("workitem_edit"),
    validateRequest(updateWorkitemSchema),
    handleUpdateWorkitem,
);

router.patch(
    "/:id/status",
    requirePermission("workitem_status"),
    validateRequest(updateWorkitemStatusSchema),
    handleUpdateWorkitemStatus,
);

router.delete(
    "/:id",
    requirePermission("workitem_delete"),
    validateRequest(workitemIdParamSchema),
    handleDeleteWorkitem,
);

router.post(
    "/:id/discussions",
    validateRequest(createWorkitemDiscussionSchema),
    handleCreateWorkitemDiscussion,
);

router.get(
    "/:id/discussions",
    validateRequest(workitemDiscussionsQuerySchema),
    handleGetWorkitemDiscussions,
);

router.put(
    "/:id/discussions/:discussionId",
    validateRequest(updateWorkitemDiscussionSchema),
    handleUpdateWorkitemDiscussion,
);

router.delete(
    "/:id/discussions/:discussionId",
    validateRequest(workitemDiscussionIdParamSchema),
    handleDeleteWorkitemDiscussion,
);

router.get(
    "/:id/activities",
    requirePermission("workitem_view"),
    validateRequest(workitemActivitiesQuerySchema),
    handleGetWorkitemActivities,
);

router.post(
    "/:id/media",
    validateRequest(workitemIdParamSchema),
    uploadMedia.single("file"),
    handleUploadWorkitemMedia,
);

router.get(
    "/:id/media",
    validateRequest(workitemMediaQuerySchema),
    handleGetWorkitemMediaList,
);

router.delete(
    "/:id/media/:mediaId",
    validateRequest(workitemMediaIdParamSchema),
    handleDeleteWorkitemMedia,
);

export { router as workitemRoutes };
