import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useOrganizationStore } from "@/store/organization.store";

const SOCKET_URL = import.meta.env.VITE_PUBLIC_SOCKET_URL ?? "";

let globalSocket: Socket | null = null;
let currentSocketKey = "";

export const useSocket = (): Socket | null => {
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const socketKey =
        token && activeOrganization?.id
            ? `${token}_${activeOrganization.id}`
            : "";

    if (socketKey) {
        if (!globalSocket || currentSocketKey !== socketKey) {
            if (globalSocket) {
                globalSocket.disconnect();
            }
            globalSocket = io(SOCKET_URL, {
                auth: {
                    authorization: `Bearer ${token}`,
                    org_id: activeOrganization?.id,
                },
                transports: ["websocket", "polling"],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
            });
            currentSocketKey = socketKey;
        }
    } else {
        if (globalSocket) {
            globalSocket.disconnect();
            globalSocket = null;
            currentSocketKey = "";
        }
    }

    const [socket, setSocket] = useState<Socket | null>(globalSocket);

    useEffect(() => {
        setSocket(globalSocket);

        if (!globalSocket) return;

        const onConnect = () => {
            setSocket(globalSocket);
        };

        const onDisconnect = () => {
            setSocket(globalSocket);
        };

        globalSocket.on("connect", onConnect);
        globalSocket.on("disconnect", onDisconnect);

        return () => {
            if (globalSocket) {
                globalSocket.off("connect", onConnect);
                globalSocket.off("disconnect", onDisconnect);
            }
        };
    }, [socketKey]);

    return socket;
};
