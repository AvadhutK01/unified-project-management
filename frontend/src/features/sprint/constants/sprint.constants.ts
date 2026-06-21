import type { SprintItem, SprintStatus } from "../types/sprint.types";

export const STATUS_LABELS: Record<SprintStatus, string> = {
    new: "New",
    active: "Active",
    closed: "Closed",
    removed: "Removed",
    onhold: "On Hold",
};

export const STATUS_STYLES: Record<SprintStatus, string> = {
    new: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800",
    active: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800",
    closed: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    removed:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800",
    onhold: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800",
};

export const SPRINT_STATUSES: SprintStatus[] = [
    "new",
    "active",
    "closed",
    "removed",
    "onhold",
];

export const MOCK_SPRINTS: SprintItem[] = [
    {
        id: "SPR-001",
        title: "User Authentication Module",
        description:
            "Implement login, registration, and password reset flows with JWT-based authentication.",
        acceptanceCriteria:
            "Users can register, login, reset password via email. All endpoints return proper JWT tokens.",
        status: "active",
    },
    {
        id: "SPR-002",
        title: "Dashboard Analytics",
        description:
            "Build interactive charts and metrics widgets for the admin dashboard.",
        acceptanceCriteria:
            "Dashboard shows active users, revenue chart, conversion rate, and top-performing campaigns.",
        status: "new",
    },
    {
        id: "SPR-003",
        title: "Payment Integration",
        description:
            "Integrate Stripe payment gateway for subscription billing and one-time payments.",
        acceptanceCriteria:
            "Users can subscribe, upgrade, downgrade, and cancel plans. Refunds work via admin panel.",
        status: "active",
    },
    {
        id: "SPR-004",
        title: "Notification System",
        description:
            "Email and in-app notification system with real-time delivery via WebSockets.",
        acceptanceCriteria:
            "Users receive email + in-app notifications. Admins can configure notification templates.",
        status: "onhold",
    },
    {
        id: "SPR-005",
        title: "Role-Based Access Control",
        description:
            "Implement RBAC with custom roles, permissions, and scopes for enterprise tenants.",
        acceptanceCriteria:
            "Admins can create/assign roles with granular permissions. Permission checks enforced server-side.",
        status: "new",
    },
    {
        id: "SPR-006",
        title: "Mobile Responsive Navigation",
        description:
            "Refactor sidebar and top navigation to be fully responsive on mobile and tablet devices.",
        acceptanceCriteria:
            "Navigation collapses to hamburger menu on <768px. All dropdowns are touch-friendly.",
        status: "closed",
    },
    {
        id: "SPR-007",
        title: "Data Export Feature",
        description:
            "Allow users to export reports in CSV, Excel, and PDF formats with scheduled exports.",
        acceptanceCriteria:
            "Users can export filtered data. Scheduled exports run daily/weekly via cron. Email delivery of exports.",
        status: "new",
    },
    {
        id: "SPR-008",
        title: "Legacy API Migration",
        description:
            "Migrate legacy REST endpoints to new GraphQL API layer with backward compatibility.",
        acceptanceCriteria:
            "All existing clients work without changes. New GraphQL queries return identical data shapes.",
        status: "removed",
    },
    {
        id: "SPR-009",
        title: "Audit Logging",
        description:
            "Comprehensive audit trail for all admin actions with searchable log viewer.",
        acceptanceCriteria:
            "Every state-changing action is logged. Admins can search/filter logs by user, action, date range.",
        status: "active",
    },
    {
        id: "SPR-010",
        title: "Performance Optimization",
        description:
            "Optimize database queries, implement caching layer, and lazy-load route components.",
        acceptanceCriteria:
            "Page load times reduced by 60%. Lighthouse score >90 for all pages. API response times <200ms p95.",
        status: "onhold",
    },
];

export const SPRINT_STATUS_OPTIONS = [
    { value: "new", label: "New" },
    { value: "active", label: "Active" },
    { value: "closed", label: "Closed" },
    { value: "removed", label: "Removed" },
    { value: "onhold", label: "On Hold" },
] as const;
