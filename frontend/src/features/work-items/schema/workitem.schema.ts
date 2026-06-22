import { z } from "zod";

export const workItemFormSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().optional(),
    acceptanceCriteria: z.string().optional(),
    status: z.enum(
        ["new", "active", "resolved", "closed", "removed", "onhold"],
        {
            message: "Please select a status",
        },
    ),
    type: z.enum(["task", "bug"], {
        message: "Please select a type",
    }),
    estimatedTime: z
        .number()
        .nonnegative("Estimated time must be a non-negative number")
        .optional(),
    remainingTime: z
        .number()
        .nonnegative("Remaining time must be a non-negative number")
        .optional(),
    completionTime: z
        .number()
        .nonnegative("Completed time must be a non-negative number")
        .optional(),
    assignedTo: z.string().optional(),
});

export type WorkItemFormValues = z.infer<typeof workItemFormSchema>;
