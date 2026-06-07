import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().default("supersecret"),
    AWS_ACCESS_KEY_ID: z.string().default("mock-key"),
    AWS_SECRET_ACCESS_KEY: z.string().default("mock-secret"),
    AWS_REGION: z.string().default("us-east-1"),
    AWS_BUCKET_NAME: z.string().default("mock-bucket"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;
