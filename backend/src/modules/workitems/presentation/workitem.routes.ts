import { Router } from "express";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import { validateRequest } from "../../../shared/validators/index.js";
import { uploadMedia } from "../../../shared/middleware/upload.js";
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
    workitemMediaQuerySchema,
    workitemMediaIdParamSchema,
} from "./workitem.validation.js";

const router = Router();

router.use(authenticate);
router.use(requireOrgId);

// Core Workitem endpoints
router.post("/", validateRequest(createWorkitemSchema), handleCreateWorkitem);

router.get(
    "/",
    validateRequest(getWorkitemsQuerySchema),
    handleGetAllWorkitems,
);

router.get(
    "/:id",
    validateRequest(workitemIdParamSchema),
    handleGetWorkitemById,
);

router.put("/:id", validateRequest(updateWorkitemSchema), handleUpdateWorkitem);

router.patch(
    "/:id/status",
    validateRequest(updateWorkitemStatusSchema),
    handleUpdateWorkitemStatus,
);

router.delete(
    "/:id",
    validateRequest(workitemIdParamSchema),
    handleDeleteWorkitem,
);

// Workitem Discussions endpoints
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

// Workitem Activity Logs endpoint
router.get(
    "/:id/activities",
    validateRequest(workitemIdParamSchema),
    handleGetWorkitemActivities,
);

// Workitem Media endpoints
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
