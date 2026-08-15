import { z } from "zod";
import { SPRINT_STATUS } from "../../../shared/constants/enumConstants.js";

const sprintStatusSchema = z.enum([
    SPRINT_STATUS.NEW,
    SPRINT_STATUS.ACTIVE,
    SPRINT_STATUS.ON_HOLD,
    SPRINT_STATUS.REMOVED,
    SPRINT_STATUS.CLOSED,
]);

/**
 * Schema for creating a new sprint.
 */
export const createSprintSchema = z.object({
    body: z
        .object({
            title: z.string().min(1).max(255),
            description: z.string().max(2000).optional(),
            phaseId: z.string().uuid(),
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
            sequence: z.number().int().optional(),
            acceptanceCriteria: z.string().max(5000).optional(),
            status: sprintStatusSchema.optional(),
        })
        .refine(
            (data) =>
                !data.startDate ||
                !data.endDate ||
                data.startDate < data.endDate,
            {
                message: "Start date must be before end date",
                path: ["startDate"],
            },
        )
        .refine(
            (data) =>
                !data.startDate ||
                !data.endDate ||
                data.endDate > data.startDate,
            {
                message: "End date must be after start date",
                path: ["endDate"],
            },
        ),
});

/**
 * Schema for updating an existing sprint.
 */
export const updateSprintSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z
        .object({
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
            sequence: z.number().int().nullable().optional(),
            acceptanceCriteria: z.string().max(5000).nullable().optional(),
            status: sprintStatusSchema.optional(),
        })
        .refine(
            (data) =>
                !data.startDate ||
                !data.endDate ||
                data.startDate < data.endDate,
            {
                message: "Start date must be before end date",
                path: ["startDate"],
            },
        )
        .refine(
            (data) =>
                !data.startDate ||
                !data.endDate ||
                data.endDate > data.startDate,
            {
                message: "End date must be after start date",
                path: ["endDate"],
            },
        ),
});

/**
 * Schema for updating sprint status.
 */
export const updateSprintStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        status: sprintStatusSchema,
    }),
});

/**
 * Schema for sprint ID parameter.
 */
export const sprintIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

/**
 * Schema for listing sprints with pagination and filtering.
 */
export const listSprintsQuerySchema = z.object({
    query: z.object({
        phaseId: z.string().uuid(),
        page: z.string().regex(/^\d+$/).optional().transform(Number),
        limit: z.string().regex(/^\d+$/).optional().transform(Number),
        search: z.string().optional(),
        status: sprintStatusSchema.optional(),
    }),
});

/**
 * Schema for listing sprint activity logs with pagination.
 */
export const getSprintActivitiesSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    query: z.object({
        page: z.string().regex(/^\d+$/).optional().transform(Number),
        limit: z.string().regex(/^\d+$/).optional().transform(Number),
    }),
});
