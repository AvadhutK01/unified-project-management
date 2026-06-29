import { z } from "zod";

export const projectDashboardParamsSchema = z.object({
    params: z.object({
        projectId: z.string().uuid(),
    }),
});

export const phaseDashboardParamsSchema = z.object({
    params: z.object({
        phaseId: z.string().uuid(),
    }),
});
