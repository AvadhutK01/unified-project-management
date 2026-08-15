import { z } from "zod";
import { PHASE_STATUS } from "../../../shared/constants/enumConstants.js";

const phaseStatusSchema = z.enum([
    PHASE_STATUS.NOT_STARTED,
    PHASE_STATUS.STARTED,
    PHASE_STATUS.ON_HOLD,
    PHASE_STATUS.COMPLETED,
]);

/**
 * Schema for creating a new phase.
 */
export const createPhaseSchema = z.object({
    body: z
        .object({
            projectId: z.string().uuid(),
            name: z.string().min(1).max(255),
            description: z.string().max(2000).optional(),
            type: z.string().max(255).optional(),
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
            status: phaseStatusSchema.optional(),
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
 * Schema for updating an existing phase.
 */
export const updatePhaseSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z
        .object({
            name: z.string().min(1).max(255).optional(),
            description: z.string().max(2000).nullable().optional(),
            type: z.string().max(255).nullable().optional(),
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
            status: phaseStatusSchema.optional(),
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
 * Schema for phase ID parameter.
 */
export const phaseIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

/**
 * Schema for listing phases with pagination and filtering.
 */
export const listPhasesQuerySchema = z.object({
    query: z.object({
        projectId: z.string().uuid(),
        page: z.string().regex(/^\d+$/).optional().transform(Number),
        limit: z.string().regex(/^\d+$/).optional().transform(Number),
        search: z.string().optional(),
    }),
});
