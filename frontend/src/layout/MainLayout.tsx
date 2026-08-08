import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ChatBot from "@/components/common/ChatBot";
import CallModal from "@/components/common/CallModal";
import { CallProvider } from "@/features/call/context/CallContext";
import { DirectChatProvider } from "@/features/chat/context/DirectChatContext";
import { DirectChatDrawer } from "@/features/chat/components/DirectChatDrawer";
import { useNotificationSocket } from "@/features/notifications/hooks/useNotificationSocket";
import { useNotificationInit } from "@/features/notifications/hooks/useNotificationInit";
import { useUserActivityTracker } from "@/features/presence/hooks/useUserActivityTracker";
import type { ReactNode } from "react";

const MainLayoutContent = ({ children }: { children: ReactNode }) => {
    useNotificationInit();
    useNotificationSocket();
    useUserActivityTracker();

    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 min-w-0 w-full bg-card">
                <Header />
                <div className="h-[calc(100vh-65px)]! overflow-y-auto">
                    {children}
                </div>
            </main>
            <ChatBot />
            <CallModal />
            <DirectChatDrawer />
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
            <DirectChatProvider>
                <MainLayoutContent>{children}</MainLayoutContent>
            </DirectChatProvider>
        </CallProvider>
    );
};

export default MainLayout;
