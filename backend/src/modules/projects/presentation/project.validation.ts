import { z } from "zod";

const projectStatusSchema = z.enum([
    "notstarted",
    "started",
    "onhold",
    "completed",
]);

const orgMemberIdsSchema = z
    .preprocess((val) => {
        if (typeof val === "string") {
            try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch {
                if (val.includes(",")) {
                    return val.split(",").map((item) => item.trim());
                }
                return [val];
            }
        }
        return val;
    }, z.array(z.string().uuid()))
    .optional();

export const createProjectSchema = z.object({
    body: z.object({
        title: z.string().min(1).max(255),
        description: z.string().max(2000).optional(),
        startDate: z
            .string()
            .regex(
                /^\d{4}-\d{2}-\d{2}$/,
                "Start date must be in YYYY-MM-DD format",
            )
            .optional(),
        endDate: z
            .string()
            .regex(
                /^\d{4}-\d{2}-\d{2}$/,
                "End date must be in YYYY-MM-DD format",
            )
            .optional(),
        clientName: z.string().max(255).optional(),
        logoUrl: z.string().max(1000).optional(),
        status: projectStatusSchema.optional(),
        orgMemberIds: orgMemberIdsSchema,
    }),
});

export const updateProjectSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(2000).nullable().optional(),
        startDate: z
            .string()
            .regex(
                /^\d{4}-\d{2}-\d{2}$/,
                "Start date must be in YYYY-MM-DD format",
            )
            .nullable()
            .optional(),
        endDate: z
            .string()
            .regex(
                /^\d{4}-\d{2}-\d{2}$/,
                "End date must be in YYYY-MM-DD format",
            )
            .nullable()
            .optional(),
        clientName: z.string().max(255).nullable().optional(),
        logoUrl: z.string().max(1000).nullable().optional(),
        status: projectStatusSchema.optional(),
        orgMemberIds: orgMemberIdsSchema,
    }),
});

export const projectIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const projectMemberSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        orgMemberId: z.string().uuid(),
    }),
});

export const projectMemberParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
        orgMemberId: z.string().uuid(),
    }),
});
