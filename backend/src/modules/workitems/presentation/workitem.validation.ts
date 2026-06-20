import { z } from "zod";

export const createWorkitemSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required").max(255),
        description: z.string().optional(),
        assignedTo: z.string().uuid("Invalid assignedTo UUID").optional(),
        status: z
            .enum(["new", "active", "resolved", "closed", "removed", "onhold"])
            .optional(),
        priority: z.number().int().min(1).max(5).optional(),
        acceptanceCriteria: z.string().optional(),
        workitemType: z.enum(["task", "bug"]),
        sprintId: z.string().uuid("Invalid sprint ID"),
    }),
});

export const updateWorkitemSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid workitem ID"),
    }),
    body: z.object({
        title: z.string().min(1, "Title is required").max(255).optional(),
        description: z.string().nullable().optional(),
        assignedTo: z
            .string()
            .uuid("Invalid assignedTo UUID")
            .nullable()
            .optional(),
        status: z
            .enum(["new", "active", "resolved", "closed", "removed", "onhold"])
            .optional(),
        priority: z.number().int().min(1).max(5).optional(),
        acceptanceCriteria: z.string().nullable().optional(),
        workitemType: z.enum(["task", "bug"]).optional(),
    }),
});

export const updateWorkitemStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid workitem ID"),
    }),
    body: z.object({
        status: z.enum([
            "new",
            "active",
            "resolved",
            "closed",
            "removed",
            "onhold",
        ]),
    }),
});

export const getWorkitemsQuerySchema = z.object({
    query: z.object({
        sprintId: z.string().uuid("Invalid sprint ID"),
        page: z.string().regex(/^\d+$/).optional().transform(Number),
        limit: z.string().regex(/^\d+$/).optional().transform(Number),
        search: z.string().optional(),
    }),
});

export const workitemIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid workitem ID"),
    }),
});

export const createWorkitemDiscussionSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid workitem ID"),
    }),
    body: z.object({
        comment: z.string().min(1, "Comment is required"),
        taggedMemberIds: z.array(z.string().uuid()).optional(),
    }),
});

export const updateWorkitemDiscussionSchema = z.object({
    params: z.object({
        discussionId: z.string().uuid("Invalid discussion ID"),
    }),
    body: z.object({
        comment: z.string().min(1, "Comment is required"),
        taggedMemberIds: z.array(z.string().uuid()).optional(),
    }),
});

export const workitemDiscussionIdParamSchema = z.object({
    params: z.object({
        discussionId: z.string().uuid("Invalid discussion ID"),
    }),
});

export const workitemDiscussionsQuerySchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid workitem ID"),
    }),
    query: z.object({
        page: z.string().regex(/^\d+$/).optional().transform(Number),
        limit: z.string().regex(/^\d+$/).optional().transform(Number),
    }),
});

export const workitemMediaIdParamSchema = z.object({
    params: z.object({
        mediaId: z.string().uuid("Invalid media ID"),
    }),
});

export const workitemMediaQuerySchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid workitem ID"),
    }),
    query: z.object({
        page: z.string().regex(/^\d+$/).optional().transform(Number),
        limit: z.string().regex(/^\d+$/).optional().transform(Number),
        search: z.string().optional(),
    }),
});
