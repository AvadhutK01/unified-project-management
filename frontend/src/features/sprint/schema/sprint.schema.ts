import { z } from "zod";

export const sprintFormSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(1, "Description is required"),
    acceptanceCriteria: z.string().min(1, "Acceptance criteria is required"),
    status: z.enum(["new", "active", "closed", "removed", "onhold"], {
        message: "Please select a status",
    }),
    startDate: z.date({ message: "Please select a valid start date" }),
    endDate: z.date({ message: "Please select a valid end date" }),
    sequence: z
        .number()
        .int()
        .nonnegative("Sequence must be a non-negative number"),
});

export type SprintFormValues = z.infer<typeof sprintFormSchema>;
