import { z } from "zod";

export const createRoleSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(255),
        description: z.string().max(1000).optional(),
        permissionIds: z.array(z.string().uuid()).optional(),
        isActive: z.boolean().optional(),
    }),
});

export const updateRoleSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().min(2).max(255).optional(),
        description: z.string().max(1000).nullable().optional(),
        permissionIds: z.array(z.string().uuid()).optional(),
        isActive: z.boolean().optional(),
    }),
});

export const roleIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const paginationQuerySchema = z.object({
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
