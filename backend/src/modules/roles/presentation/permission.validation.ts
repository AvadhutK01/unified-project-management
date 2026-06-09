import { z } from "zod";

export const permissionPaginationQuerySchema = z.object({
    query: z
        .object({
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
        })
        .default({}),
});
