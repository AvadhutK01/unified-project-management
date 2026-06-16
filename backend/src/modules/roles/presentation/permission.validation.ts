import { z } from "zod";

export const permissionQuerySchema = z.object({
    query: z
        .object({
            search: z.string().optional(),
        })
        .default({}),
});
