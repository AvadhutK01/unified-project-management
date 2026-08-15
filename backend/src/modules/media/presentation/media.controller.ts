import { Request, Response } from "express";
import {
    getS3ObjectStream,
    fixUtf8Filename,
} from "../../../shared/utils/s3.js";
import {
    badRequestError,
    notFoundError,
} from "../../../shared/errors/app-error.js";

/**
 * Streams/downloads a media attachment file from S3.
 * Proxies the file securely with Content-Disposition: attachment so the browser downloads it directly to disk.
 * Supports token query parameter for direct link fallback.
 *
 * @param req Express Request.
 * @param res Express Response.
 */
export const handleDownloadMedia = async (req: Request, res: Response) => {
    try {
        const rawUrl = (req.query["url"] ||
            req.query["fileUrl"] ||
            req.query["key"]) as string;
        if (!rawUrl) {
            throw badRequestError("File URL or key parameter is required");
        }

        const customName = req.query["name"] as string | undefined;
        let fileName = customName ? fixUtf8Filename(customName) : "";

        if (!fileName) {
            const parts = rawUrl.split("/");
            const rawFilename = parts[parts.length - 1] || "download";
            const cleanName = rawFilename.replace(/^\d+_\d*_?/, "");
            fileName = fixUtf8Filename(decodeURIComponent(cleanName));
        }

        const s3Data = await getS3ObjectStream(rawUrl);

        const encodedFilename = encodeURIComponent(fileName);

        res.setHeader("Content-Type", s3Data.contentType);
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
        );

        if (s3Data.contentLength) {
            res.setHeader("Content-Length", s3Data.contentLength.toString());
        }

        s3Data.stream.pipe(res);
    } catch (error: any) {
        if (error?.name === "NoSuchKey" || error?.name === "NotFound") {
            throw notFoundError("File not found");
        }
        console.error("Error downloading file from S3:", error);
        throw error;
    }
};
