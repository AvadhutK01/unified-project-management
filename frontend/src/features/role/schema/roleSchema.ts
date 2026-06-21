import { z } from "zod";

export const roleSchema = z.object({
    name: z
        .string()
        .min(3, "Role name must be at least 3 characters")
        .max(50, "Role name must be at most 50 characters"),
    description: z
        .string()
        .min(5, "Description must be at least 5 characters")
        .max(255, "Description must be at most 255 characters"),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
