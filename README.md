# unified-project-management

# Starting on 02-06-2026

## UI/UX

Unified has a modern, responsive SaaS interface built on React, Tailwind CSS v4 and shadcn/ui (Radix), designed around:

- **Project management** — projects, phases and their progress, organized in a clear Organization → Project → Phase → Sprint → Work Item hierarchy with breadcrumbs on every level.
- **Sprint management** — list and Kanban views with drag-and-drop status changes, sprint timelines and work-item breakdowns.
- **Work tracking** — task/bug work items with status, assignee, estimated / remaining / completed time, descriptions and acceptance criteria.
- **Team collaboration** — comments with @mentions, attachments, activity timelines, notifications, direct chat and voice/video calls.
- **Reporting** — project, phase, sprint and member-activity reports with date filters, summary metrics and Excel export.
- **Organization management** — workspaces, members and invitations, role-based permission matrix, organization settings and billing.

Design system highlights:

- Semantic design tokens (`frontend/src/index.css`) with intentionally designed **light and dark themes** (light / dark / system toggle).
- One status-tone system (`frontend/src/lib/tones.ts`) so every status reads with the same colour everywhere.
- Shared building blocks in `frontend/src/components/common` — `PageHeader`, `Breadcrumbs`, `StatCard`, `StatusBadge`, `DataTable`, `EmptyState` / `ErrorState`, skeleton loaders, `Toolbar` (search, pagination, view switcher), Kanban frames and collaboration panels.
- Responsive from 375px phones to wide desktops: collapsible sidebar, mobile navigation drawer, horizontally scrollable tables and boards, single-column forms on small screens.
- Accessibility: keyboard-reachable menus and dialogs (Radix), visible focus rings, labelled icon buttons with tooltips, and reduced-motion support.
