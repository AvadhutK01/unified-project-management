import { z } from "zod";

export const inviteMembersSchema = z.object({
    body: z.object({
        invitations: z
            .array(
                z.object({
                    email: z.string().email("Invalid email address"),
                    roleId: z.string().uuid("Invalid role ID format"),
                }),
            )
            .min(1, "At least one invitation is required"),
    }),
});

export const updateInvitationStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid invitation ID format"),
    }),
    body: z.object({
        status: z.enum(["accepted", "rejected"], {
            errorMap: () => ({
                message: "Status must be either accepted or rejected",
            }),
        }),
    }),
});

export const organizationMembersQuerySchema = z.object({
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
        type: z.enum(["invited", "joined"], {
            errorMap: () => ({
                message: "Type must be either invited or joined",
            }),
        }),
        search: z.string().optional(),
    }),
});

export const reInviteMemberSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        roleId: z.string().uuid("Invalid role ID format"),
    }),
});

export const getMemberDetailsSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid member ID format"),
    }),
});

export const editMemberDetailsSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid member ID format"),
    }),
    body: z
        .object({
            roleId: z.string().uuid("Invalid role ID format").optional(),
            status: z
                .enum(["active", "inactive", "onleave"], {
                    errorMap: () => ({
                        message: "Status must be active, inactive, or onleave",
                    }),
                })
                .optional(),
        })
        .refine(
            (data) => data.roleId !== undefined || data.status !== undefined,
            {
                message:
                    "At least one of roleId or status must be provided for edit",
            },
        ),
});

export const deleteMemberSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid member ID format"),
    }),
});

export const revokeInvitationSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid invitation ID format"),
    }),
});

export const projectMembersQuerySchema = z.object({
    params: z.object({
        projectId: z.string().uuid("Invalid project ID format"),
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
        search: z.string().optional(),
    }),
});
