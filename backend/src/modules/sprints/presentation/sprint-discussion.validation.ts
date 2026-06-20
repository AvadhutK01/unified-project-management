import { z } from "zod";

export const createDiscussionSchema = z.object({
    params: z.object({
        sprintId: z.string().uuid("Invalid sprint ID format"),
    }),
    body: z.object({
        comment: z.string().trim().min(1, "Comment cannot be empty"),
        taggedMemberIds: z
            .array(z.string().uuid("Invalid tagged member ID format"))
            .optional(),
    }),
});

export const updateDiscussionSchema = z.object({
    params: z.object({
        sprintId: z.string().uuid("Invalid sprint ID format"),
        discussionId: z.string().uuid("Invalid discussion ID format"),
    }),
    body: z.object({
        comment: z.string().trim().min(1, "Comment cannot be empty"),
        taggedMemberIds: z
            .array(z.string().uuid("Invalid tagged member ID format"))
            .optional(),
    }),
});

export const deleteDiscussionSchema = z.object({
    params: z.object({
        sprintId: z.string().uuid("Invalid sprint ID format"),
        discussionId: z.string().uuid("Invalid discussion ID format"),
    }),
});

export const listDiscussionsQuerySchema = z.object({
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
    }),
});
