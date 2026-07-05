import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useOrganizationStore } from "@/store/organization.store";

const SOCKET_URL = import.meta.env.VITE_PUBLIC_SOCKET_URL ?? "";

export const useSocket = (): Socket | null => {
    const socketRef = useRef<Socket | null>(null);
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !activeOrganization?.id) return;

        const socket = io(SOCKET_URL, {
            auth: {
                authorization: `Bearer ${token}`,
                org_id: activeOrganization.id,
            },
            transports: ["websocket"],
            autoConnect: true,
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [activeOrganization?.id]);

    return socketRef.current;
};
