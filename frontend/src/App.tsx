import "./App.css";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
    Outlet,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import Spinner from "./components/common/Spinner";
import { Toaster } from "sonner";
import Home from "./pages/Home";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const VerifyOtp = lazy(() => import("./pages/auth/VerifyOtp"));

const Loading = () => (
    <div className="flex h-screen items-center justify-center">
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
                path: "/login",
                element: (
                    <Suspense fallback={<Loading />}>
                        <Login />
                    </Suspense>
                ),
            },
            {
                path: "/register",
                element: (
                    <Suspense fallback={<Loading />}>
                        <Register />
                    </Suspense>
                ),
            },
            {
                path: "/verify-otp",
                element: (
                    <Suspense fallback={<Loading />}>
                        <VerifyOtp />
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
