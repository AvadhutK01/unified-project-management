import { Router } from "express";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { requireOrgId } from "../../../shared/middleware/require-org-id.js";
import { uploadMedia } from "../../../shared/middleware/upload.js";
import {
    handleGetDirectChatHistory,
    handleMarkDirectChatRead,
    handleUploadDirectChatAttachment,
} from "./chat.controller.js";

const router = Router();

router.use(authenticate);

/**
 * GET /api/members/chat/:recipientId
 * Retrieves paginated 1-to-1 direct chat history with a recipient member.
 */
router.get("/:recipientId", requireOrgId, handleGetDirectChatHistory);

/**
 * POST /api/members/chat/read/:senderId
 * Marks direct chat messages from a specific sender as read.
 */
router.post("/read/:senderId", requireOrgId, handleMarkDirectChatRead);

/**
 * POST /api/members/chat/upload
 * Uploads an attachment file for direct chat messaging to S3 storage.
 */
router.post(
    "/upload",
    requireOrgId,
    uploadMedia.single("file"),
    handleUploadDirectChatAttachment,
);

export const chatRouter = router;
