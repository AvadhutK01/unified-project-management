import { z } from "zod";

export const inviteMemberEntrySchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),
    role: z.string().min(1, "Please select a role"),
});

export const inviteMembersSchema = z.object({
    entries: z.array(inviteMemberEntrySchema).min(1, "Add at least one member"),
});

export type InviteMemberEntry = z.infer<typeof inviteMemberEntrySchema>;
export type InviteMembersFormData = z.infer<typeof inviteMembersSchema>;
