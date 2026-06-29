import { getDeepOrganizationContext as getDeepOrgCtxRepo } from "../infrastructure/chat.repository.js";
import { notFoundError } from "../../../shared/errors/app-error.js";

/**
 * Retrieves the deep organization context for the AI Chatbot.
 * @param organizationId The organization UUID.
 * @throws AppError if organization is not found.
 * @returns The deep organization context.
 */
export const getDeepOrganizationContext = async (organizationId: string) => {
    const data = await getDeepOrgCtxRepo(organizationId);
    if (!data) {
        throw notFoundError("Organization not found");
    }
    return data;
};
