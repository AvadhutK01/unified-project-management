import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { router } from "./router/router";

function App() {
    return (
        <TooltipProvider delayDuration={300}>
            <Toaster position="bottom-right" closeButton />
            <RouterProvider router={router} />
        </TooltipProvider>
    );
}

export default App;
