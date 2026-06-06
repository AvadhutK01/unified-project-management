import z from "zod";

export const registerSchema = z
    .object({
        fullName: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(60, "Name is too long"),
        email: z.email("Please enter a valid email address"),
        mobile: z
            .string()
            .regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid mobile number"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .refine(
                (v) => /[A-Z]/.test(v),
                "Must contain at least one uppercase letter",
            )
            .refine((v) => /[0-9]/.test(v), "Must contain at least one number"),
        confirmPassword: z.string(),
        terms: z.literal(true, "You must accept the terms"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const loginSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
