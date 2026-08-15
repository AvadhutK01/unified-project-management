import { Router } from "express";
import { authenticate } from "../../../shared/middleware/authenticate.js";
import { handleDownloadMedia } from "./media.controller.js";

export const mediaRouter = Router();

/**
 * GET /api/v1/media/download
 * Secure media download route that proxies S3 files with Content-Disposition: attachment.
 */
mediaRouter.get("/download", authenticate, handleDownloadMedia);
