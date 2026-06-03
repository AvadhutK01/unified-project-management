import "./App.css";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
    Outlet,
} from "react-router-dom";
import { Suspense } from "react";
import Spinner from "./components/common/Spinner";
import { Toaster } from "sonner";
import Home from "./pages/Home";

const Loading = () => (
    <div className="flex h-full items-center justify-center py-24">
        <Spinner />
    </div>
);

const RouteError = () => {
    return <Navigate to="/" replace />;
};

const RootLayout = () => {
    return (
        <>
            <div className="">
                <Outlet />
            </div>
            {/* <BottomNav /> */}
        </>
    );
};

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        errorElement: <RouteError />,
        children: [
            {
                path: "/",
                element: (
                    <Suspense fallback={<Loading />}>
                        <Home />
                    </Suspense>
                ),
            },
            {
                path: "*",
                element: <Navigate to="/" replace />,
            },
        ],
    },
]);

function App() {
    return (
        <>
            <Toaster />
            <RouterProvider router={router} />
        </>
    );
}

export default App;
