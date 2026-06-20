import { z } from "zod";

export const deleteSprintMediaSchema = z.object({
    params: z.object({
        sprintId: z.string().uuid("Invalid sprint ID format"),
        mediaId: z.string().uuid("Invalid media ID format"),
    }),
});

export const listSprintMediaQuerySchema = z.object({
    params: z.object({
        sprintId: z.string().uuid("Invalid sprint ID format"),
    }),
    query: z.object({
        page: z
            .string()
            .regex(/^\d+$/, "Page must be a valid number")
            .transform(Number)
            .default("1"),
        limit: z
            .string()
            .regex(/^\d+$/, "Limit must be a valid number")
            .transform(Number)
            .default("10"),
        search: z.string().optional(),
    }),
});
