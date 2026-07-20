import { Router } from "express";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import { validateRequest } from "../../../shared/validators/index.js";
import {
    handleGetNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
} from "./notification.controller.js";
import {
    getNotificationsQuerySchema,
    notificationIdParamSchema,
} from "./notification.validation.js";

const router = Router();

router.use(authenticate);

router.get(
    "/",
    requireOrgId,
    validateRequest(getNotificationsQuerySchema),
    handleGetNotifications,
);
router.patch(
    "/:id/read",
    validateRequest(notificationIdParamSchema),
    handleMarkAsRead,
);
router.post("/read-all", requireOrgId, handleMarkAllAsRead);

export { router as notificationRouter };
