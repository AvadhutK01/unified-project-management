import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../config/env.js";

const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Fixes Multer's default latin1 header decoding for non-ASCII / UTF-8 filenames (e.g. Hindi, Devanagari, Marathi, Arabic, Chinese).
 */
export const fixUtf8Filename = (
    filename: string | null | undefined,
): string => {
    if (!filename) return "";

    const hasHighCodePoints = Array.from(filename).some(
        (char) => char.charCodeAt(0) > 255,
    );
    if (hasHighCodePoints) {
        return filename;
    }

    if (/%[0-9A-Fa-f]{2}/.test(filename)) {
        try {
            const decoded = decodeURIComponent(filename);
            if (decoded && !decoded.includes("\uFFFD")) {
                return decoded;
            }
        } catch {}
    }

    try {
        const decoded = Buffer.from(filename, "latin1").toString("utf8");
        if (decoded && !decoded.includes("\uFFFD")) {
            return decoded;
        }
    } catch {}

    return filename;
};

/**
 * Uploads a file to AWS S3.
 * @param file The Express.Multer.File object.
 * @returns The S3 URL of the uploaded file.
 */
export const uploadToS3 = async (
    file: Express.Multer.File,
    folder: string = "logos",
): Promise<string> => {
    const fixedName = fixUtf8Filename(file.originalname);
    file.originalname = fixedName;

    const sanitizedKeyName = encodeURIComponent(fixedName);
    const key = `${folder}/${Date.now()}_${sanitizedKeyName}`;

    if (env.NODE_ENV === "test" || env.AWS_ACCESS_KEY_ID === "mock-key") {
        return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
    }

    await s3Client.send(
        new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentDisposition: `inline; filename="${encodeURIComponent(fixedName)}"; filename*=UTF-8''${encodeURIComponent(fixedName)}`,
        }),
    );

    return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
};
