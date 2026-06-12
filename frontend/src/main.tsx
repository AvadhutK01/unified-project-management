import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import QueryProvider from "./providers/QueryProvider.tsx";
import ConfirmProvider from "@/providers/ConfirmProvider.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryProvider>
            <ConfirmProvider>
                <App />
            </ConfirmProvider>
        </QueryProvider>
    </StrictMode>,
);
