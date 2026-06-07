import { z } from "zod";

export const createOrganizationSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(255),
        slug: z
            .string()
            .min(2)
            .max(255)
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "Slug must be lowercase alphanumeric with hyphens",
            ),
        logoUrl: z.string().url().optional(),
        websiteUrl: z.string().url().optional(),
        description: z.string().max(1000).optional(),
        status: z.enum(["active", "inactive"]).optional(),
    }),
});

export const updateOrganizationSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().min(2).max(255).optional(),
        slug: z
            .string()
            .min(2)
            .max(255)
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                "Slug must be lowercase alphanumeric with hyphens",
            )
            .optional(),
        logoUrl: z.string().url().nullable().optional(),
        websiteUrl: z.string().url().nullable().optional(),
        description: z.string().max(1000).nullable().optional(),
        status: z.enum(["active", "inactive"]).optional(),
    }),
});

export const organizationIdParamSchema = z.object({
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
