import { Request } from "express";
import multer from "multer";
import { badRequestError } from "../errors/app-error.js";

const storage = multer.memoryStorage();

export const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
): void => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        cb(badRequestError("Only image files (JPEG, PNG, WEBP) are allowed."));
        return;
    }
    cb(null, true);
};

export const uploadImage = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter,
});

export const mediaFileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
): void => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    const isAllowedDoc = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ].includes(file.mimetype);

    if (!isImage && !isVideo && !isAllowedDoc) {
        cb(badRequestError("File type not allowed."));
        return;
    }
    cb(null, true);
};

export const uploadMedia = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
    fileFilter: mediaFileFilter,
});
