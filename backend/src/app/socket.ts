import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { handleChatConnection } from "../modules/chat/presentation/chat.socket.js";

export const initializeSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
        },
    });

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
            (socket as any).user = decoded;

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

            (socket as any).orgId = orgId;

            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    chatNamespace.on("connection", (socket: Socket) => {
        handleChatConnection(socket);
    });

    return io;
};
