import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useOrganizationStore } from "@/store/organization.store";

const SOCKET_URL = import.meta.env.VITE_PUBLIC_SOCKET_URL ?? "";

export const useSocket = (): Socket | null => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const activeOrganization = useOrganizationStore(
        (s) => s.activeOrganization,
    );

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !activeOrganization?.id) return;

        const newSocket = io(SOCKET_URL, {
            auth: {
                authorization: `Bearer ${token}`,
                org_id: activeOrganization.id,
            },
            transports: ["websocket"],
            autoConnect: true,
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [activeOrganization?.id]);

    return socket;
};
