import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    DATABASE_TEST_URL: z.string().url().optional(),
    JWT_SECRET: z.string().default("supersecret"),
    AWS_ACCESS_KEY_ID: z.string().default("mock-key"),
    AWS_SECRET_ACCESS_KEY: z.string().default("mock-secret"),
    AWS_REGION: z.string().default("us-east-1"),
    AWS_BUCKET_NAME: z.string().default("mock-bucket"),
    GEMINI_API_KEY: z.string().optional(),
    REDIS_URL: z.string().default("redis://localhost:6379"),
    RAZORPAY_KEY_ID: z.string().default("rzp_test_mockkeyid"),
    RAZORPAY_KEY_SECRET: z.string().default("rzp_test_mockkeysecret"),
    RAZORPAY_WEBHOOK_SECRET: z.string().default("webhook_secret_mock"),
    SUBSCRIPTION_AMOUNT_PAISE: z.coerce.number().default(99900),
    SUPPORT_EMAIL: z.string().default("support@unifiedpm.com"),
    SUPPORT_PHONE: z.string().default("+1 (800) 555-0199"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;
