import { z } from "zod";

export const projectFormSchema = z.object({
    projectName: z
        .string()
        .min(2, "Project name must be at least 2 characters"),
    description: z.string(),

    client: z.string().nonempty("Client is required"),

    projectTeam: z.array(z.string()).min(1, "Select at least one team member"),

    startDate: z.date({
        message: "Please select a valid start date",
    }),
    endDate: z.date({
        message: "Please select a valid end date",
    }),

    status: z.enum(["notstarted", "started", "on_hold", "completed"], {
        message: "Please select a status",
    }),
    projectImage: z.any().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
