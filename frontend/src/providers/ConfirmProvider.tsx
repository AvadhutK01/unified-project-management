import React, { createContext, useCallback, useContext, useState } from "react";
import ConfirmModal from "../components/common/ConfirmModal";

type ConfirmOptions = {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
};

type ConfirmContextType = {
    confirm: (options?: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({});
    const [resolver, setResolver] = useState<
        ((value: boolean) => void) | undefined
    >(undefined);

    const confirm = useCallback((opts?: ConfirmOptions) => {
        setOptions(opts ?? {});
        setOpen(true);
        return new Promise<boolean>((resolve) => {
            setResolver(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setOpen(false);
        resolver?.(true);
        setResolver(undefined);
    }, [resolver]);

    const handleCancel = useCallback(() => {
        setOpen(false);
        resolver?.(false);
        setResolver(undefined);
    }, [resolver]);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmModal
                open={open}
                title={options.title}
                description={options.description}
                confirmText={options.confirmText}
                cancelText={options.cancelText}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
};

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
    return ctx.confirm;
}

export default ConfirmProvider;
