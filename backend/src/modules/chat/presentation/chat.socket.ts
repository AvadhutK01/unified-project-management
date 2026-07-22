import { Socket } from "socket.io";
import { getDeepOrganizationContext } from "../application/chat.use-cases.js";
import { streamOrganizationChatResponse } from "../../../shared/services/ai.socket.service.js";
import { isOrganizationOnPlan } from "../../../shared/middleware/require-premium.js";

export const handleChatConnection = (socket: Socket) => {
    socket.on("chat:message", async (payload: { message: string }) => {
        const { message } = payload;
        const organizationId = (socket as any).orgId;

        if (!organizationId || !message) {
            socket.emit("chat:error", {
                error: "Organization ID and message are required",
            });
            return;
        }

        const isPremium = await isOrganizationOnPlan(organizationId, "premium");
        if (!isPremium) {
            socket.emit("chat:error", {
                error: "Premium subscription required. Upgrade your organization to access AI Assistant features.",
            });
            return;
        }

        try {
            const contextData =
                await getDeepOrganizationContext(organizationId);

            socket.emit("chat:reply:start", { status: "started" });

            await streamOrganizationChatResponse(
                message,
                contextData,
                (chunk) => {
                    socket.emit("chat:reply:chunk", { chunk });
                },
            );

            socket.emit("chat:reply:end", { status: "done" });
        } catch (error) {
            console.error("Socket chat error:", error);
            socket.emit("chat:error", {
                error: "Failed to process chat message.",
            });
        }
    });
};
