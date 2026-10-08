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
        <div className="flex h-dvh overflow-hidden bg-background">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[300] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-elevated"
            >
                Skip to content
            </a>
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <Header />
                <main
                    id="main-content"
                    tabIndex={-1}
                    className="flex-1 overflow-x-hidden overflow-y-auto outline-none"
                >
                    {children}
                </main>
            </div>
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
