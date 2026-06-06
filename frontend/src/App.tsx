import "./App.css";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
    Outlet,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import Spinner from "./components/common/Spinner";
import { toast, Toaster } from "sonner";
import Home from "./pages/Home";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const VerifyOtp = lazy(() => import("./pages/auth/VerifyOtp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));

const Loading = () => (
    <div className="flex h-screen items-center justify-center">
        <Spinner />
    </div>
);

const RouteError = () => {
    return <Navigate to="/" replace />;
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        toast.error("Please login to continue");
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");

    if (token) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
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
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    </Suspense>
                ),
            },
            {
                path: "/login",
                element: (
                    <Suspense fallback={<Loading />}>
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    </Suspense>
                ),
            },
            {
                path: "/register",
                element: (
                    <Suspense fallback={<Loading />}>
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    </Suspense>
                ),
            },
            {
                path: "/verify-otp",
                element: (
                    <Suspense fallback={<Loading />}>
                        <PublicRoute>
                            <VerifyOtp />
                        </PublicRoute>
                    </Suspense>
                ),
            },
            {
                path: "/forgot-password",
                element: (
                    <Suspense fallback={<Loading />}>
                        <PublicRoute>
                            <ForgotPassword />
                        </PublicRoute>
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
