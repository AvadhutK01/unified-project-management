import { useCallback, useMemo } from "react";
import { useStore } from "@/store/store";

export const usePermission = () => {
    const permissions = useStore((s) => s.permissions);
    const isOrgOwner = useStore((s) => s.isOrgOwner);

    const permissionSet = useMemo(() => new Set(permissions), [permissions]);

    const hasPermission = useCallback(
        (codename: string): boolean => {
            if (isOrgOwner) return true;
            return permissionSet.has(codename);
        },
        [isOrgOwner, permissionSet],
    );

    return { hasPermission, isOrgOwner };
};
