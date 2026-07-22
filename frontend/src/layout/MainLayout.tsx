import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ChatBot from "@/components/common/ChatBot";
import CallModal from "@/components/common/CallModal";
import { CallProvider } from "@/features/call/context/CallContext";
import { useNotificationSocket } from "@/features/notifications/hooks/useNotificationSocket";
import { useNotificationInit } from "@/features/notifications/hooks/useNotificationInit";
import type { ReactNode } from "react";

const MainLayoutContent = ({ children }: { children: ReactNode }) => {
    useNotificationInit();
    useNotificationSocket();

    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 w-[calc(100%-260px)] bg-card">
                <Header />
                <div className="h-[calc(100vh-65px)]! overflow-y-auto">
                    {children}
                </div>
            </main>
            <ChatBot />
            <CallModal />
        </div>
    );
};

const MainLayout = ({
    children,
}: Readonly<{
    children: ReactNode;
}>) => {
    return (
        <CallProvider>
            <MainLayoutContent>{children}</MainLayoutContent>
        </CallProvider>
    );
};

export default MainLayout;
