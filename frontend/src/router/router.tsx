import { Loading } from "@/components/common/Loading";
import { PrivateRoute } from "@/components/common/PrivateRoute";
import { PublicRoute } from "@/components/common/PublicRoute";
import { RootLayout } from "@/layout/RootLayout";
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layout/MainLayout";
import { ProtectedRoute } from "@/features/rbac/components/ProtectedRoute";
import { PERMISSIONS } from "@/features/rbac/types/rbac.types";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Home = lazy(() => import("@/pages/Home"));
const ForgotPassword = lazy(
    () => import("@/features/auth/pages/ForgotPassword"),
);
const Login = lazy(() => import("@/features/auth/pages/Login"));
const Register = lazy(() => import("@/features/auth/pages/Register"));
const VerifyOtp = lazy(() => import("@/features/auth/pages/VerifyOtp"));
const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"));
const CreateOrganization = lazy(
    () => import("@/features/organization/pages/CreateOrganization"),
);
const JoinOrganization = lazy(
    () => import("@/features/organization/pages/JoinOrganization"),
);
const OrganizationInfo = lazy(
    () => import("@/features/organization/pages/OrganizationInfo"),
);
const OrganizationLoader = lazy(
    () => import("@/features/organization/pages/OrganizationLoader"),
);
const OrganizationSelector = lazy(
    () => import("@/features/organization/pages/OrganizationSelector"),
);
const OrganizationSetup = lazy(
    () => import("@/features/organization/pages/OrganizationSetup"),
);
const OrganizationSuccess = lazy(
    () => import("@/features/organization/pages/OrganizationSuccess"),
);
const AddRole = lazy(() => import("@/features/role/pages/AddRole"));
const EditRole = lazy(() => import("@/features/role/pages/EditRole"));
const Roles = lazy(() => import("@/features/role/pages/Roles"));
const JoinedMembers = lazy(
    () => import("@/features/members/pages/JoinedMembers"),
);
const InvitedMembers = lazy(
    () => import("@/features/members/pages/InvitedMembers"),
);
const ProjectsListPage = lazy(
    () => import("@/features/projects/pages/ProjectsListPage"),
);
const Phases = lazy(() => import("@/features/phases/pages/Phases"));
const SprintPage = lazy(() => import("@/features/sprint/pages/SprintPage"));
const SprintDetailsPage = lazy(
    () => import("@/features/sprint/pages/SprintDetailsPage"),
);
const WorkItems = lazy(() => import("@/features/work-items/pages/WorkItems"));
const WorkItemDetailsPage = lazy(
    () => import("@/features/work-items/pages/WorkItemDetailsPage"),
);

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
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
                path: "/:slug/roles",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <ProtectedRoute
                                    permission={PERMISSIONS.ROLES.LIST}
                                >
                                    <Roles />
                                </ProtectedRoute>
                            </PrivateRoute>
                        </MainLayout>
                    </Suspense>
                ),
            },
            {
                path: "/:slug/roles/add",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <ProtectedRoute
                                    permission={PERMISSIONS.ROLES.ADD}
                                >
                                    <AddRole />
                                </ProtectedRoute>
                            </PrivateRoute>
                        </MainLayout>
                    </Suspense>
                ),
            },
            {
                path: "/:slug/roles/edit/:roleId",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <ProtectedRoute
                                    permission={PERMISSIONS.ROLES.EDIT}
                                >
                                    <EditRole />
                                </ProtectedRoute>
                            </PrivateRoute>
                        </MainLayout>
                    </Suspense>
                ),
            },
            {
                path: "/:slug/members/joined",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <ProtectedRoute
                                    permission={PERMISSIONS.MEMBERS.LIST}
                                >
                                    <JoinedMembers />
                                </ProtectedRoute>
                            </PrivateRoute>
                        </MainLayout>
                    </Suspense>
                ),
            },
            {
                path: "/:slug/members/invited",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <ProtectedRoute
                                    permission={PERMISSIONS.MEMBERS.LIST}
                                >
                                    <InvitedMembers />
                                </ProtectedRoute>
                            </PrivateRoute>
                        </MainLayout>
                    </Suspense>
                ),
            },
            {
                path: "/:slug/projects",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <ProtectedRoute
                                    permission={PERMISSIONS.PROJECTS.LIST}
                                >
                                    <ProjectsListPage />
                                </ProtectedRoute>
                            </PrivateRoute>
                        </MainLayout>
                    </Suspense>
                ),
            },
            {
                path: "/:slug/projects/:id/phases",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <ProtectedRoute
                                    permission={PERMISSIONS.PROJECTS.LIST}
                                >
                                    <Phases />
                                </ProtectedRoute>
                            </PrivateRoute>
                        </MainLayout>
                    </Suspense>
                ),
            },
            {
                path: "/:slug/projects/:id/phases/:phaseId/sprints",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <ProtectedRoute
                                    permission={PERMISSIONS.SPRINT.LIST}
                                >
                                    <SprintPage />
                                </ProtectedRoute>
                            </PrivateRoute>
                        </MainLayout>
                    </Suspense>
                ),
            },
            {
                path: "/:slug/projects/:id/phases/:phaseId/sprints/:sprintId",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <ProtectedRoute
                                    permission={PERMISSIONS.SPRINT.VIEW}
                                >
                                    <SprintDetailsPage />
                                </ProtectedRoute>
                            </PrivateRoute>
                        </MainLayout>
                    </Suspense>
                ),
            },
            {
                path: "/:slug/projects/:id/phases/:phaseId/sprints/:sprintId/work-items",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <WorkItems />
                            </PrivateRoute>
                        </MainLayout>
                    </Suspense>
                ),
            },
            {
                path: "/:slug/projects/:id/phases/:phaseId/sprints/:sprintId/work-items/:workItemId",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MainLayout>
                            <PrivateRoute>
                                <WorkItemDetailsPage />
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
