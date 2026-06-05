import { z } from "zod";

export const registerSchema = z.object({
    body: z
        .object({
            username: z.string().min(3).max(50),
            email: z.string().email(),
            password: z
                .string()
                .min(8)
                .regex(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                ),
            phoneNumber: z
                .string()
                .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
                .optional(),
            phone_number: z
                .string()
                .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
                .optional(),
        })
        .refine((data) => data.phoneNumber || data.phone_number, {
            message: "Phone number is required",
            path: ["phoneNumber"],
        }),
});

export const verifyOtpSchema = z.object({
    body: z
        .object({
            email: z.string().email(),
            phoneNumber: z.string().optional(),
            phone_number: z.string().optional(),
            emailOtp: z
                .string()
                .regex(/^\d{6}$/, "OTP must be exactly 6 digits")
                .optional(),
            email_otp: z
                .string()
                .regex(/^\d{6}$/, "OTP must be exactly 6 digits")
                .optional(),
            phoneOtp: z
                .string()
                .regex(/^\d{6}$/, "OTP must be exactly 6 digits")
                .optional(),
            phone_otp: z
                .string()
                .regex(/^\d{6}$/, "OTP must be exactly 6 digits")
                .optional(),
        })
        .refine((data) => data.phoneNumber || data.phone_number, {
            message: "Phone number is required",
            path: ["phoneNumber"],
        })
        .refine(
            (data) =>
                (data.emailOtp || data.email_otp) &&
                (data.phoneOtp || data.phone_otp),
            {
                message: "Both email and phone OTP are required",
                path: ["emailOtp"],
            },
        ),
});

export const resendOtpSchema = z.object({
    body: z
        .object({
            email: z.string().email().optional(),
            phoneNumber: z
                .string()
                .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
                .optional(),
            phone_number: z
                .string()
                .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
                .optional(),
        })
        .refine((data) => data.email || data.phoneNumber || data.phone_number, {
            message: "Either email or phone number must be provided",
            path: ["email"],
        }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string(),
    }),
});

export const generateResetPwdOtpSchema = z.object({
    body: z.object({
        email: z.string().email(),
    }),
});

export const verifyResetPwdOtpSchema = z.object({
    body: z.object({
        email: z.string().email(),
        otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string(),
        password: z
            .string()
            .min(8)
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            ),
    }),
});
