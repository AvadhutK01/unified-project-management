import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { handleChatConnection } from "../modules/chat/presentation/chat.socket.js";
import { handleCallConnection } from "../modules/call/presentation/call.socket.js";
import { handleDirectChatConnection } from "../modules/chat/presentation/direct-chat.socket.js";

import type { AuthenticatedSocket } from "../shared/types/socket.js";

let socketServer: Server | null = null;

/**
 * Initializes the Socket.io server instance with JWT auth middleware and namespace handlers.
 * @param httpServer The Node.js HTTP server instance.
 * @returns The initialized Socket.io Server instance.
 */
export const initializeSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
        },
    });

    socketServer = io;

    const chatNamespace = io.of("/socket.io");

    chatNamespace.use((socket, next) => {
        const authHeader = socket.handshake.auth.authorization;
        if (!authHeader) {
            return next(new Error("Authentication error: No token provided"));
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : authHeader;

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as {
                id: string;
                email: string;
            };
            const authSocket = socket as AuthenticatedSocket;
            authSocket.user = decoded;

            const orgId = socket.handshake.auth.org_id;

            if (!orgId) {
                return next(
                    new Error("Organization error: No org_id provided"),
                );
            }

            const uuidRegex =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (typeof orgId !== "string" || !uuidRegex.test(orgId as string)) {
                return next(
                    new Error("Organization error: Invalid org_id format"),
                );
            }

            authSocket.orgId = orgId;

            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    chatNamespace.on("connection", async (socket: Socket) => {
        const authSocket = socket as AuthenticatedSocket;
        const user = authSocket.user;
        const orgId = authSocket.orgId;
        if (user && user.id && orgId) {
            const roomName = `org:${orgId}`;
            const userRoom = `user:${user.id}:org:${orgId}`;
            socket.join(roomName);
            socket.join(userRoom);

            const { setUserPresence, removeUserPresence, getOrgPresence } =
                await import("../modules/organizations/application/presence.service.js");

            await setUserPresence(orgId, user.id, "active");
            chatNamespace.to(roomName).emit("presence:update", {
                memberId: user.id,
                status: "active",
            });

            const currentPresence = await getOrgPresence(orgId);
            socket.emit("presence:sync", currentPresence);

            socket.on(
                "user:status_change",
                async (data: { status: "active" | "away" }) => {
                    await setUserPresence(orgId, user.id, data.status);
                    chatNamespace.to(roomName).emit("presence:update", {
                        memberId: user.id,
                        status: data.status,
                    });
                },
            );

            socket.on("presence:request_sync", async () => {
                const freshPresence = await getOrgPresence(orgId);
                socket.emit("presence:sync", freshPresence);
            });

            socket.on("disconnect", async () => {
                socket.leave(roomName);
                await removeUserPresence(orgId, user.id);
                chatNamespace.to(roomName).emit("presence:update", {
                    memberId: user.id,
                    status: "offline",
                });
            });
        }
        handleChatConnection(socket);
        handleCallConnection(socket);
        handleDirectChatConnection(socket);
    });

    return io;
};

/**
 * Retrieves the global Socket.io server instance.
 * @throws Error if Socket.io has not been initialized yet.
 * @returns The active Socket.io Server instance.
 */
export const getSocketServer = (): Server => {
    if (!socketServer) {
        throw new Error("Socket.io is not initialized");
    }
    return socketServer;
};
