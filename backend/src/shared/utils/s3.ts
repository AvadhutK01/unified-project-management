import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
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
            ContentDisposition: `attachment; filename="${encodeURIComponent(fixedName)}"; filename*=UTF-8''${encodeURIComponent(fixedName)}`,
        }),
    );

    return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
};

/**
 * Extracts the object key from a full S3 URL or returns key directly.
 * Preserves exact encoding as stored in S3.
 * @param urlOrKey The full S3 URL or object key.
 */
export const extractS3Key = (urlOrKey: string): string => {
    if (!urlOrKey) return "";
    if (urlOrKey.startsWith("http://") || urlOrKey.startsWith("https://")) {
        try {
            const parsed = new URL(urlOrKey);
            return parsed.pathname.replace(/^\//, "");
        } catch {
            return urlOrKey;
        }
    }
    return urlOrKey;
};

/**
 * Downloads/streams an S3 object using GetObjectCommand.
 * Includes key fallback logic for both raw encoded and decoded key formats (e.g. %20 vs spaces).
 * @param urlOrKey Full S3 URL or object key.
 */
export const getS3ObjectStream = async (urlOrKey: string) => {
    const rawKey = extractS3Key(urlOrKey);

    const keysToTry: string[] = [rawKey];

    try {
        const decoded = decodeURIComponent(rawKey);
        if (decoded !== rawKey && !keysToTry.includes(decoded)) {
            keysToTry.push(decoded);
        }
    } catch {}

    try {
        const reEncoded = encodeURI(decodeURIComponent(rawKey));
        if (!keysToTry.includes(reEncoded)) {
            keysToTry.push(reEncoded);
        }
    } catch {}

    let lastError: any = null;

    for (const key of keysToTry) {
        try {
            const command = new GetObjectCommand({
                Bucket: env.AWS_BUCKET_NAME,
                Key: key,
            });

            const response = (await s3Client.send(
                command,
            )) as GetObjectCommandOutput;
            return {
                stream: response.Body as import("stream").Readable,
                contentType: response.ContentType || "application/octet-stream",
                contentLength: response.ContentLength,
            };
        } catch (err: any) {
            lastError = err;
            if (
                err?.name === "NoSuchKey" ||
                err?.name === "NotFound" ||
                err?.$metadata?.httpStatusCode === 404
            ) {
                continue;
            }
            throw err;
        }
    }

    throw lastError;
};
