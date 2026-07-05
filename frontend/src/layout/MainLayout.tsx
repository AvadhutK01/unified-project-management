import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ChatBot from "@/components/common/ChatBot";
import type { ReactNode } from "react";

const MainLayout = ({
    children,
}: Readonly<{
    children: ReactNode;
}>) => {
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
        </div>
    );
};

export default MainLayout;
