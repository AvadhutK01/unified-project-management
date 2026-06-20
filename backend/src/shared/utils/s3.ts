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
 * Uploads a file to AWS S3.
 * @param file The Express.Multer.File object.
 * @returns The S3 URL of the uploaded file.
 */
export const uploadToS3 = async (
    file: Express.Multer.File,
    folder: string = "logos",
): Promise<string> => {
    const key = `${folder}/${Date.now()}_${file.originalname}`;
    if (env.NODE_ENV === "test" || env.AWS_ACCESS_KEY_ID === "mock-key") {
        return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
    }

    await s3Client.send(
        new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }),
    );

    return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
};
