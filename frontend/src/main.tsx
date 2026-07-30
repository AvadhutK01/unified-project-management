import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.tsx";
import QueryProvider from "./providers/QueryProvider.tsx";
import ConfirmProvider from "@/providers/ConfirmProvider.tsx";
import { AppInitializer } from "@/providers/AppInitializer.tsx";

const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "1234567890-example.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        ,
        <GoogleOAuthProvider clientId={googleClientId}>
            <QueryProvider>
                <ConfirmProvider>
                    <AppInitializer>
                        <App />
                    </AppInitializer>
                </ConfirmProvider>
            </QueryProvider>
        </GoogleOAuthProvider>
    </StrictMode>,
);
