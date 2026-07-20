import { useEffect, useRef } from "react";
import { getNotifications } from "../api/notification.api";
import { useNotificationStore } from "@/store/notification.store";

export const useNotificationInit = () => {
    const setInitial = useNotificationStore((s) => s.setInitial);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        getNotifications(1, 50).then((res) => {
            setInitial(res.data);
        });
    }, [setInitial]);
};
