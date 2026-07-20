import { z } from "zod";

export const getNotificationsQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().default(10),
    }),
});

export const notificationIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid notification ID"),
    }),
});
