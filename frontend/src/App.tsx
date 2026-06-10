import "./App.css";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
    Outlet,
    useLocation,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import Spinner from "./components/common/Spinner";
import { toast, Toaster } from "sonner";
import Home from "./pages/Home";
import Dashboard from "./features/dashboard/Dashboard";
import { useOrganizationStore } from "./store/organization.store";
import MainLayout from "./layout/MainLayout";

const Login = lazy(() => import("./features/auth/pages/Login"));
const Register = lazy(() => import("./features/auth/pages/Register"));
const VerifyOtp = lazy(() => import("./features/auth/pages/VerifyOtp"));
const ForgotPassword = lazy(
    () => import("./features/auth/pages/ForgotPassword"),
);
const OrganizationSetup = lazy(
    () => import("./features/organization/pages/OrganizationSetup"),
);
const CreateOrganization = lazy(
    () => import("./features/organization/pages/CreateOrganization"),
);
const JoinOrganization = lazy(
    () => import("./features/organization/pages/JoinOrganization"),
);
const OrganizationSelector = lazy(
    () => import("./features/organization/pages/OrganizationSelector"),
);
const OrganizationSuccess = lazy(
    () => import("./features/organization/pages/OrganizationSuccess"),
);
const OrganizationLoader = lazy(
    () => import("./features/organization/pages/OrganizationLoader"),
);
const OrganizationInfo = lazy(
    () => import("./features/organization/pages/OrganizationInfo"),
);
const NotFound = lazy(() => import("./pages/NotFound"));

const Loading = () => (
    <div className="flex h-screen items-center justify-center">
        <Spinner />
    </div>
);

const RouteError = () => {
    return (
        <Suspense fallback={<Loading />}>
            <NotFound />
        </Suspense>
    );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");
    const location = useLocation();
    const activeOrganization = useOrganizationStore(
        (state) => state.activeOrganization,
    );

    if (!token) {
        toast.dismiss();
        toast.error("Please login to continue");
        return <Navigate to="/login" replace />;
    }

    const allowedPaths = [
        "/organization-loader",
        "/org-setup",
        "/org-setup/create",
        "/org-setup/join",
        "/org-setup/select",
        "/org-setup/success",
    ];
    const isAllowedPath = allowedPaths.some(
        (path) =>
            location.pathname === path || location.pathname.startsWith(path),
    );

    if (!activeOrganization && !isAllowedPath) {
        return <Navigate to="/organization-loader" replace />;
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
                path: "/organization-loader",
                element: (
                    <Suspense fallback={<Loading />}>
                        <PrivateRoute>
                            <OrganizationLoader />
                        </PrivateRoute>
                    </Suspense>
                ),
            },
            {
                path: "/org-setup",
                element: (
                    <Suspense fallback={<Loading />}>
                        <PrivateRoute>
                            <OrganizationSetup />
                        </PrivateRoute>
                    </Suspense>
                ),
            },
            {
                path: "/org-setup/create",
                element: (
                    <Suspense fallback={<Loading />}>
                        <PrivateRoute>
                            <CreateOrganization />
                        </PrivateRoute>
                    </Suspense>
                ),
            },
            {
                path: "/org-setup/join",
                element: (
                    <Suspense fallback={<Loading />}>
                        <PrivateRoute>
                            <JoinOrganization />
                        </PrivateRoute>
                    </Suspense>
                ),
            },
            {
                path: "/org-setup/select",
                element: (
                    <Suspense fallback={<Loading />}>
                        <PrivateRoute>
                            <OrganizationSelector />
                        </PrivateRoute>
                    </Suspense>
                ),
            },
            {
                path: "/org-setup/success",
                element: (
                    <Suspense fallback={<Loading />}>
                        <PrivateRoute>
                            <OrganizationSuccess />
                        </PrivateRoute>
                    </Suspense>
                ),
            },
            {
                path: "/:slug/dashboard",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        </MainLayout>
                    </Suspense>
                ),
            },
            {
                path: "/:slug/organization",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <OrganizationInfo />
                            </PrivateRoute>
                        </MainLayout>
                    </Suspense>
                ),
            },
            {
                path: "*",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <NotFound />
                        </MainLayout>
                    </Suspense>
                ),
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
