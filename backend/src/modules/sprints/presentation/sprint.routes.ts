import { Router } from "express";
import {
    handleCreateSprint,
    handleGetSprintById,
    handleGetAllSprints,
    handleUpdateSprint,
    handleUpdateSprintStatus,
    handleDeleteSprint,
    handleGetSprintActivities,
} from "./sprint.controller.js";
import {
    handleCreateDiscussion,
    handleUpdateDiscussion,
    handleGetDiscussions,
    handleDeleteDiscussion,
} from "./sprint-discussion.controller.js";
import {
    handleUploadMedia,
    handleGetMediaList,
    handleDeleteMedia,
} from "./sprint-media.controller.js";
import { validateRequest } from "../../../shared/validators/index.js";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import {
    createSprintSchema,
    updateSprintSchema,
    updateSprintStatusSchema,
    sprintIdParamSchema,
    listSprintsQuerySchema,
    getSprintActivitiesSchema,
} from "./sprint.validation.js";
import {
    createDiscussionSchema,
    updateDiscussionSchema,
    deleteDiscussionSchema,
    listDiscussionsQuerySchema,
} from "./sprint-discussion.validation.js";
import {
    listSprintMediaQuerySchema,
    deleteSprintMediaSchema,
} from "./sprint-media.validation.js";
import { requirePermission } from "../../../shared/middleware/require-permission.js";
import { uploadMedia } from "../../../shared/middleware/upload.js";

const router = Router();

router.use(authenticate);
router.use(requireOrgId);

router.post(
    "/",
    requirePermission("sprint_add"),
    validateRequest(createSprintSchema),
    handleCreateSprint,
);

router.get(
    "/",
    requirePermission("sprint_list"),
    validateRequest(listSprintsQuerySchema),
    handleGetAllSprints,
);

router.get(
    "/:id",
    requirePermission("sprint_view"),
    validateRequest(sprintIdParamSchema),
    handleGetSprintById,
);

router.get(
    "/:id/activities",
    requirePermission("sprint_view"),
    validateRequest(getSprintActivitiesSchema),
    handleGetSprintActivities,
);

router.put(
    "/:id",
    requirePermission("sprint_edit"),
    validateRequest(updateSprintSchema),
    handleUpdateSprint,
);

router.patch(
    "/:id/status",
    requirePermission("sprint_status"),
    validateRequest(updateSprintStatusSchema),
    handleUpdateSprintStatus,
);

router.delete(
    "/:id",
    requirePermission("sprint_delete"),
    validateRequest(sprintIdParamSchema),
    handleDeleteSprint,
);

router.post(
    "/:sprintId/discussions",
    validateRequest(createDiscussionSchema),
    handleCreateDiscussion,
);

router.get(
    "/:sprintId/discussions",
    validateRequest(listDiscussionsQuerySchema),
    handleGetDiscussions,
);

router.put(
    "/:sprintId/discussions/:discussionId",
    validateRequest(updateDiscussionSchema),
    handleUpdateDiscussion,
);

router.delete(
    "/:sprintId/discussions/:discussionId",
    validateRequest(deleteDiscussionSchema),
    handleDeleteDiscussion,
);

router.post("/:sprintId/media", uploadMedia.single("file"), handleUploadMedia);

router.get(
    "/:sprintId/media",
    validateRequest(listSprintMediaQuerySchema),
    handleGetMediaList,
);

router.delete(
    "/:sprintId/media/:mediaId",
    validateRequest(deleteSprintMediaSchema),
    handleDeleteMedia,
);

export { router as sprintRouter };
