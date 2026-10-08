# Unified — Frontend Documentation & Audit

_Scope: `frontend/` only (React SPA). Audited 2026-10-08 against `main` @ `3d0afb6` plus uncommitted working-tree changes._

---

## 1. At a glance

| Item           | Value                                                                                                                                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product        | **Unified** — multi-tenant project management (Organization → Project → Phase → Sprint → Work Item)                                                                                                                                      |
| Stack          | React 19, TypeScript 6, Vite 8, React Router 7, TanStack Query 5, Zustand 5, Tailwind 4 + shadcn/Radix UI, react-hook-form + zod, Tiptap (rich text), dnd-kit (Kanban), socket.io-client, WebRTC, Razorpay Checkout, xlsx (Excel export) |
| Size           | ~200 source files, ~33k lines in `src/`                                                                                                                                                                                                  |
| Routes         | **33** (5 auth, 7 onboarding, 20 in-app, 1 not-found)                                                                                                                                                                                    |
| Global widgets | AI ChatBot, Direct Chat drawer, Voice/Video Call modal, Notification bell & panel, Org switcher                                                                                                                                          |
| Tests          | 14 test files / 125 tests — **all pass**, but **only cover the auth feature**                                                                                                                                                            |
| Type-check     | **36 errors** → `npm run build` currently **fails**                                                                                                                                                                                      |
| Lint           | **250 problems** (217 errors, 33 warnings)                                                                                                                                                                                               |

### Health summary

| Area            | Rating | Headline                                                                        |
| --------------- | ------ | ------------------------------------------------------------------------------- |
| Security        | 🔴     | Stored XSS via unsanitized rich-text; JWT in `localStorage`                     |
| Build           | 🔴     | `tsc -b` fails (36 errors), so a fresh production build can't be produced       |
| Plan gating     | 🔴     | Reports advertised on **Basic** but routes require **Premium**                  |
| Navigation      | 🟠     | Dead links (`/profile`, `/settings`), placeholder `Home`, `:slug` not validated |
| Mocked features | 🟠     | Join Organization, Invite link, Quick actions are fake                          |
| Error handling  | 🟠     | Any 403 from the API ejects the user to the org selector                        |
| Code quality    | 🟡     | Heavy duplication (Sprint vs Work Item, Add vs Edit Role); 128 `any`            |
| Tests           | 🟡     | 0 tests outside auth                                                            |

---

## 2. Application architecture

```
main.tsx
 └─ GoogleOAuthProvider
     └─ QueryProvider (TanStack Query)
         └─ ConfirmProvider (global confirm dialog)
             └─ AppInitializer
                 └─ App → <Toaster/> + <RouterProvider router/>
                       └─ RootLayout
                           ├─ Public pages  (PublicRoute)
                           ├─ Onboarding    (PrivateRoute)
                           └─ App pages     (MainLayout → PrivateRoute → ProtectedRoute → [PremiumRoute])
```

**MainLayout** (all in-app pages) renders: `Sidebar` · `Header` · page content · `ChatBot` · `CallModal` · `DirectChatDrawer`, wrapped in `CallProvider` and `DirectChatProvider`. It also starts notification init, the notification socket, and the presence/activity tracker.

### State

| Store                              | Location                      | Holds                                                          | Persisted                                  |
| ---------------------------------- | ----------------------------- | -------------------------------------------------------------- | ------------------------------------------ |
| `useOrganizationStore`             | `store/organization.store.ts` | `activeOrganization`                                           | Yes (`localStorage: organization-storage`) |
| `useStore`                         | `store/store.ts`              | sidebar open/mobile, `isOrgOwner`, `memberStatus`, permissions | —                                          |
| `useNotificationStore`             | `store/notification.store.ts` | notifications, unread count, panel open                        | —                                          |
| `sprint.store`, `work-items/store` | feature stores                | view/kanban state                                              | —                                          |
| `localStorage` keys                | —                             | `token`, `name`, `email`                                       | Yes                                        |

### API layer (`lib/axios.ts`)

- Base URL `VITE_PUBLIC_API_BASE_URL`; adds `Authorization: Bearer <token>` and `org_id: <activeOrganization.id>` to every request.
- **401** → clears storage, redirects to `/login`.
- **403** → hard redirect to `/org-setup/select` (see issue F-07).

### Real-time (`hooks/useSocket.ts`)

One global socket.io connection per `token + orgId` to `VITE_PUBLIC_SOCKET_URL`, used for presence, notifications, AI chat streaming, direct messages, and WebRTC call signalling. ICE/TURN config comes from `VITE_ICE_SERVER_*`.

### Route guards

| Guard               | Rule                                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `PublicRoute`       | If a token exists → redirect to `/`                                                                            |
| `PrivateRoute`      | No token → `/login`. No active org (outside `/organization-loader` and `/org-setup*`) → `/organization-loader` |
| `ProtectedRoute`    | Missing permission → redirect to `/:slug/dashboard`                                                            |
| `PremiumRoute`      | Plan below `minPlan` (default **premium**) → upgrade screen                                                    |
| Sidebar `ownerOnly` | Hides Organization Setup & Billing for non-owners (**menu only — the routes are not guarded**)                 |

---

## 3. User flow

```mermaid
flowchart TD
    A[Visit app] --> B{Token?}
    B -- no --> L[/login/]
    L -->|email + password| V{Verified?}
    V -- no --> OTP[/verify-otp/ email + mobile OTP/]
    OTP --> SETUP[/org-setup/]
    V -- yes --> SEL[/org-setup/select/]
    L -->|Google| G{Has verified phone?}
    G -- no --> GS[/complete-google-sso/ add phone + OTP/]
    GS --> SEL
    G -- yes --> SEL
    R[/register/ 2 steps] --> OTP
    FP[/forgot-password/ email → code → new password] --> L

    SEL -->|pick org| DASH[/:slug/dashboard/]
    SEL -->|accept/decline invites| SEL
    SEL -->|Create New| CREATE[/org-setup/create/ 3 steps]
    SETUP --> CREATE
    SETUP --> JOIN[/org-setup/join/ ⚠ mocked]
    CREATE --> SUCCESS[/org-setup/success/] --> DASH

    DASH --> PROJ[/projects/] --> PDASH[/projects/:id/]
    PROJ --> PH[/projects/:id/phases/] --> PHD[/phases/:phaseId/]
    PH --> SP[/phases/:phaseId/sprints/] --> SPD[/sprints/:sprintId/]
    SP --> WI[/sprints/:sprintId/work-items/] --> WID[/work-items/:workItemId/]
    DASH --> ROLES[/roles/] & MEM[/members/joined · invited/] & BILL[/billing/] & REP[/reports/*/] & ORG[/organization/]
```

**Hierarchy:** Organization → Projects → Phases → Sprints → Work Items (Task / Bug). Every in-app URL is prefixed with `/:slug`.

---

## 4. Page inventory (33 routes)

### 4.1 Authentication (public — 5 pages)

| #   | Route                  | Page                | What it shows / does                                                                                                                                                                                                                 |
| --- | ---------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `/login`               | `Login`             | Brand panel, "Welcome back", **Continue with Google**, email + password (show/hide), _Forgot password?_, _Create account_. Unverified users → `/verify-otp` (OTP re-sent). Verified → stores token/name/email → `/org-setup/select`. |
| 2   | `/register`            | `Register`          | 2-step wizard with step indicator. **Step 1 "Your info":** full name, email, phone + Google sign-up. **Step 2 "Security":** password, confirm password, Terms/Privacy checkbox. → `/verify-otp`.                                     |
| 3   | `/verify-otp`          | `VerifyOtp`         | Two 6-digit OTP rows (**Email code**, **Mobile code**) with 60 s resend cooldowns, "Verify & continue". → `/org-setup`. Redirects to login if opened without state.                                                                  |
| 4   | `/forgot-password`     | `ForgotPassword`    | 3-step stepper: **Enter email → Verify code → Reset password** (`ForgotPassword{Email,Otp,Reset}Step`). → `/login` with success toast.                                                                                               |
| 5   | `/complete-google-sso` | `CompleteGoogleSso` | "Email verified via Google SSO" banner. **Step 1:** add mobile number. **Step 2:** 6-digit phone OTP, change number, resend. → `/org-setup/select`.                                                                                  |

### 4.2 Onboarding & organization selection (private, no sidebar — 7 pages)

| #   | Route                  | Page                   | What it shows / does                                                                                                                                                             |
| --- | ---------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | `/`                    | `Home`                 | ⚠ Placeholder — renders the literal text "Home".                                                                                                                                 |
| 7   | `/organization-loader` | `OrganizationLoader`   | Spinner; 0 orgs → `/org-setup`, 1 org → its dashboard, many → `/org-setup/select`.                                                                                               |
| 8   | `/org-setup`           | `OrganizationSetup`    | "Welcome 👋" + two cards: **Create Organization** / **Join Organization**. "Contact support" link (`href="#"`).                                                                  |
| 9   | `/org-setup/create`    | `CreateOrganization`   | 3-step wizard. **Details:** name, slug (auto-generated). **Branding:** logo upload, website, description (300 chars). **Review & Confirm** summary card. → `/org-setup/success`. |
| 10  | `/org-setup/join`      | `JoinOrganization`     | Tabs: **Invitation Link** / **Organization Code** + Request Access. ⚠ **Fully mocked** — waits 1.5 s and shows a success toast; no API call.                                     |
| 11  | `/org-setup/select`    | `OrganizationSelector` | "Select Your Workspace": org cards (initials, colour, last active) + "Create New" card; **Pending Invitations** with Accept / Decline; profile menu with Logout.                 |
| 12  | `/org-setup/success`   | `OrganizationSuccess`  | "Organization Created Successfully 🎉", Go To Dashboard, Invite Team Members, "What's next" quick actions. ⚠ Invite and quick actions are placeholder toasts.                    |

### 4.3 In-app pages (MainLayout — 20 pages)

**Sidebar menu:** Dashboard · Organization Setup _(owner)_ · Billing & Subscriptions _(owner)_ · Roles _(roles_list)_ · Members → Joined / Invited · Projects _(project_list)_ · Reports → Project / Phase / Sprint / Member Activity _(report_view, Basic+ badge)_.
**Header:** mobile menu toggle · "Upgrade" button (owner, non-premium) · notification bell + panel · profile panel (name/email, **On-leave toggle**, View Profile, Settings, Log out).

| #   | Route (`/:slug/…`)               | Guard                     | What it shows / does                                                                                                                                                                                                                                                                                       |
| --- | -------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 13  | `dashboard`                      | private                   | Org info card (logo, title, slug, website, description) · **Stats:** Total / Active / Completed Projects, Total Members · **AI Workspace Insights** (Premium) · Project progress list · Recent work items.                                                                                                 |
| 14  | `organization`                   | private _(menu: owner)_   | Org detail card: logo, name, status badge, slug, status, description, website, created date, organization ID. **Edit** modal (name, slug, website, description, status) and **Delete** (confirm).                                                                                                          |
| 15  | `roles`                          | `roles_list`              | "Manage Roles" table: **Name**, **Members** count, Edit action. Add Role button. Search box.                                                                                                                                                                                                               |
| 16  | `roles/add`                      | `roles_add`               | Role details (name, description) + **permission matrix** (module rows × List/Add/Edit/View/Delete/Status columns) with select-all and dependency auto-ticking.                                                                                                                                             |
| 17  | `roles/edit/:roleId`             | `roles_edit`              | Same as Add, pre-filled.                                                                                                                                                                                                                                                                                   |
| 18  | `members/joined`                 | `members_joined_list`     | Table: **Member** (avatar + presence), **Role**, **Status**, **Joined**, **Actions** (Chat — Pro+, View, Edit, Remove). Search, pagination, Invite Members modal (multi-email + role). Edit modal: role + status.                                                                                          |
| 19  | `members/invited`                | `members_invited_list`    | Table: **Invited Person**, **Role**, **Invited By**, **Status** (Pending/Accepted/Rejected/Revoked), **Invited** date, Actions (Revoke). Search. Invite Members button.                                                                                                                                    |
| 20  | `projects`                       | `project_list`            | Table: **Project** (logo + name), **Status** (Not Started/Started/Completed/On Hold), **Client**, **Start/End Date**, Actions (View, Edit, Delete, Phases). Create modal: name, description, client, status, dates, cover image, members.                                                                  |
| 21  | `projects/:id`                   | `project_view`            | Breadcrumb · header (logo, title, status, rich-text description) · stat cards (**Members, Total Phases, Completed, Active Phases**) · AI Summary · **Phase Progress** · **Team Members** with presence.                                                                                                    |
| 22  | `projects/:id/phases`            | `project_list` ⚠          | Table: **Name, Type, Status, Start/End Date**, Actions (View, Edit, Delete, Sprints). Add/Edit Phase modals (name, type incl. custom, status, dates, description).                                                                                                                                         |
| 23  | `projects/:id/phases/:phaseId`   | `phase_view`              | Phase dashboard: stat cards (**Total Sprints, Completed, Active Sprints**), AI Summary, sprints list with View.                                                                                                                                                                                            |
| 24  | `…/phases/:phaseId/sprints`      | `sprint_list`             | Counters (**Total, Active, Closed**) · **List / Kanban** toggle. List: Title, Start/End Date, Status, Actions. Kanban: drag between New / Active / Closed / Removed / On Hold. Add/Edit Sprint modals (title, description, acceptance criteria, status, sequence, dates).                                  |
| 25  | `…/sprints/:sprintId`            | `sprint_view`             | Sprint header + details/tracker cards · tabs **Overview · Comments** (@mentions) **· Attachments** (upload/download/delete, 50 MB) **· Activity Log**.                                                                                                                                                     |
| 26  | `…/sprints/:sprintId/work-items` | `workitem_list`           | **List / Kanban** toggle. List: **Title, Type (Task/Bug), Status, Est., Rem., Completed, Assigned To, Actions**. Kanban by status (New/Active/Resolved/Closed/Removed/On Hold). Add/Edit modal: title, type, status, estimated/remaining/completed hours, assignee, description, acceptance criteria.      |
| 27  | `…/work-items/:workItemId`       | `workitem_view`           | Work-item header + details card · tabs **Overview · Comments · Attachments · Activity Log**.                                                                                                                                                                                                               |
| 28  | `billing`                        | private _(menu: owner)_   | Current plan + expiry · **Available Plans** (Free / Basic ₹500 / Pro ₹1000 / Premium ₹1500 per month, feature lists, "Best Value") · Razorpay checkout · Differential-pricing explainer · **Transactions** table (Date, Description, Razorpay Order ID, Amount, Status) with pagination · support contact. |
| 29  | `reports/project`                | `report_view` + Premium ⚠ | Date-range filter · table: **Project Title, Status, Phases, Members, Start/End, Created At** · Export to Excel.                                                                                                                                                                                            |
| 30  | `reports/phase`                  | `report_view` + Premium ⚠ | **Phase Name, Project Name, Type, Status, Sprints, Start/End, Created At** · Excel export.                                                                                                                                                                                                                 |
| 31  | `reports/sprint`                 | `report_view` + Premium ⚠ | **Sprint, Status, Total Work Items, New, Active, Resolved, Closed, Start/End, Created At** · Excel export.                                                                                                                                                                                                 |
| 32  | `reports/member-activity`        | `report_view` + Premium ⚠ | **Member Name, Project, Total Work Items, New, Active, Resolved, Closed, Worked Time** · Excel export.                                                                                                                                                                                                     |

### 4.4 Other

| #   | Route | Page                           |
| --- | ----- | ------------------------------ |
| 33  | `*`   | `NotFound` (inside MainLayout) |

### 4.5 Global widgets (on every in-app page)

| Widget                       | Plan    | What it does                                                                                                                                                |
| ---------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ChatBot**                  | Premium | Floating AI assistant; streams answers over socket (`chat:message` → `chat:reply:*`). Non-premium sees an upgrade prompt.                                   |
| **DirectChatDrawer**         | Pro+    | 1-to-1 member chat: text, attachments, reply, forward (ForwardModal), delete, typing and read receipts, unread badges, emoji picker; entry point for calls. |
| **CallModal / CallContext**  | Pro+    | WebRTC voice/video calls with ringtone, camera toggle, screen share.                                                                                        |
| **NotificationBell / Panel** | All     | Real-time notifications, mark-as-read, mark-all-read.                                                                                                       |
| **Presence**                 | All     | Active / away / offline dots driven by socket + activity tracker.                                                                                           |

### 4.6 Plans → features (as advertised in `subscriptionHelpers.ts`)

| Plan    | Price    | Adds                                                                           |
| ------- | -------- | ------------------------------------------------------------------------------ |
| Free    | ₹0       | Projects, work items, phases, sprints, RBAC, members, notifications            |
| Basic   | ₹500/mo  | Project, Phase, Sprint and Member Activity reports                             |
| Pro     | ₹1000/mo | Voice and video calls, screen share (direct chat is also gated to Pro in code) |
| Premium | ₹1500/mo | AI chat assistant, AI dashboard / project / phase summaries                    |

---

## 5. Audit findings

Severity: 🔴 Critical / High · 🟠 Medium · 🟡 Low

### 5.1 Security

| ID   | Sev | Finding                                                                                                                                                                                                                                                            | Location                                                                                                                                                             | Fix                                                                    |
| ---- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| F-01 | 🔴  | **Stored XSS.** User-entered rich-text (project/phase/sprint/work-item descriptions, acceptance criteria) is rendered with `dangerouslySetInnerHTML` and **no sanitizer** in the codebase. Any member can save `<img src=x onerror=…>` that runs for every viewer. | `ProjectDashboardPage.tsx:229`, `PhaseDashboardPage.tsx:229`, `sprint/components/KanbanCard.tsx:126`, `SprintOverviewTab.tsx:13,29`, `WorkItemOverviewTab.tsx:18,38` | Sanitize with DOMPurify before rendering (and sanitize on the server). |
| F-02 | 🔴  | **JWT stored in `localStorage`** and also used as the socket credential. Combined with F-01, a single XSS steals sessions.                                                                                                                                         | `lib/axios.ts`, `hooks/useSocket.ts`, auth pages                                                                                                                     | Move to httpOnly cookie, or at minimum fix F-01 and add a strict CSP.  |
| F-03 | 🟠  | Owner-only pages are hidden in the menu only. `/:slug/billing` and `/:slug/organization` have no route guard, so any member can open them by URL.                                                                                                                  | `router.tsx` (billing, organization)                                                                                                                                 | Add an `OwnerRoute` guard.                                             |
| F-04 | 🟠  | `:slug` in the URL is never compared with `activeOrganization.slug`. `/any-slug/dashboard` renders the active org's data; shared links to another org show the wrong org.                                                                                          | `PrivateRoute.tsx`, all `/:slug` routes                                                                                                                              | Resolve the org from the slug, or redirect when they differ.           |
| F-05 | 🟡  | TURN credentials (`VITE_ICE_SERVER_CREDENTIAL`) are compiled into the public bundle.                                                                                                                                                                               | `CallContext.tsx:54`                                                                                                                                                 | Issue short-lived TURN credentials from the API.                       |
| F-06 | 🟡  | `xlsx@0.18.5` has known advisories (prototype pollution, ReDoS) affecting parsing. The app only writes files, so the risk is low.                                                                                                                                  | `package.json`                                                                                                                                                       | Move to SheetJS CDN build ≥0.20.2 or `exceljs`.                        |

### 5.2 Functional bugs

| ID   | Sev | Finding                                                                                                                                                                                                                                                   | Location                                            |
| ---- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| F-07 | 🔴  | **Reports locked behind the wrong plan.** Sidebar and Billing advertise reports on **Basic**, but the four report routes use `<PremiumRoute>` with the default `minPlan="premium"`. Basic and Pro customers see the menu and get "Premium Plan Required". | `router.tsx` reports routes, `PremiumRoute.tsx:20`  |
| F-08 | 🔴  | **Global 403 handler ejects users.** Any 403 does `window.location.href = "/org-setup/select"`. Combined with F-09 and F-10, a user who clicks a button they lack permission for is thrown out of the workspace.                                          | `lib/axios.ts`                                      |
| F-09 | 🟠  | "Add Phase" button rendered without a `PHASES.ADD` check.                                                                                                                                                                                                 | `Phases.tsx:219`, `AddPhaseModal.tsx`               |
| F-10 | 🟠  | Kanban drag-to-change-status isn't gated by `sprint_status` / `workitem_status`. `canChangeStatus` is computed and never used.                                                                                                                            | `SprintPage.tsx:78,333`, `WorkItems.tsx:312`        |
| F-11 | 🟠  | Phases list route checks `PROJECTS.LIST` instead of `PHASES.LIST`.                                                                                                                                                                                        | `router.tsx` (`/projects/:id/phases`)               |
| F-12 | 🟠  | Dead links: the header links to `/profile` and `/settings`, and the Register terms checkbox links to `/terms` and `/privacy`. None of these routes exist.                                                                                                 | `Header.tsx:232,254`, `Register.tsx`                |
| F-13 | 🟠  | `/` renders a placeholder "Home" div. Logged-in users who hit `/login` or `/` land on it.                                                                                                                                                                 | `pages/Home.tsx`                                    |
| F-14 | 🟠  | After registration + OTP, `name` and `email` aren't saved to `localStorage`. The header shows blank, and chat/forward can't identify the current user (they compare by `localStorage.email`).                                                             | `VerifyOtp.tsx:65`                                  |
| F-15 | 🟠  | **Join Organization is mocked** (fake delay + success toast, no API). The success page's "Invite Team Members" and the 3 quick actions are also placeholders.                                                                                             | `JoinOrganization.tsx`, `OrganizationSuccess.tsx`   |
| F-16 | 🟠  | Report date filters default to a **hardcoded** range `2026-06-01 → 2026-06-30`.                                                                                                                                                                           | `ProjectReport.tsx:25-26` (and siblings)            |
| F-17 | 🟠  | Creating an org doesn't invalidate the `["organizations"]` query, and accepting an invitation doesn't refresh the org list, so the selector shows stale data.                                                                                             | `useOrganizations.ts`, `OrganizationSelector.tsx`   |
| F-18 | 🟡  | Org selector cards hardcode `role: "Member"` and `memberCount: 1`.                                                                                                                                                                                        | `OrganizationSelector.tsx`                          |
| F-19 | 🟡  | Roles page search box is never applied. Roles are fetched without pagination params, so only the server's first page is listed (also in the Invite/Edit Member role dropdowns). No Delete Role in the UI.                                                 | `Roles.tsx`, `role.api.ts:33`                       |
| F-20 | 🟡  | "View" member action only shows a toast — there's no member detail view. On Invited Members, re-invite mode is never set to `true`, so the re-invite path is unreachable.                                                                                 | `JoinedMembers.tsx`, `InvitedMembers.tsx:59`        |
| F-21 | 🟡  | Editing the org slug doesn't update the current URL.                                                                                                                                                                                                      | `OrganizationInfo.tsx`                              |
| F-22 | 🟡  | "Contact support" links point to `#`.                                                                                                                                                                                                                     | `OrganizationSetup.tsx`, `OrganizationSelector.tsx` |
| F-23 | 🟡  | `MainLayout` wraps `PrivateRoute` (not the other way round), so sockets and notification fetches start before the auth/org redirect runs.                                                                                                                 | `router.tsx`                                        |

### 5.3 Build & code quality

| ID   | Sev | Finding                                                                                                                                                                                                                                                          |
| ---- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q-01 | 🔴  | **`npm run build` fails**: `tsc -b` reports 36 errors (30 in test files, 6 in app code: unused vars in `MemberAvatar`, `ForwardModal`, `MemberActivity`, `SprintPage`; possible null `activeOrganization` in `useSocket.ts:29`). The committed `dist/` is stale. |
| Q-02 | 🟠  | ESLint: 250 problems — `no-explicit-any` ×128, `only-export-components` ×39, `set-state-in-effect` ×22, `exhaustive-deps` ×21, unused vars ×14, other react-hooks rules ×22.                                                                                     |
| Q-03 | 🟠  | **Test coverage only covers auth** (14 files). Projects, sprints, work items, members, roles, billing, chat and calls have 0 tests.                                                                                                                              |
| Q-04 | 🟡  | Large duplication: Sprint vs Work-Item `KanbanCard/Column/DragOverlay/StatusSelectCell/kanban-utils` and the Comments/Attachments/Activities tabs are 80–90 % identical. `AddRole` and `EditRole` are about 400 lines each and nearly identical.                 |
| Q-05 | 🟡  | Very large components: `DirectChatDrawer` (1011 lines), `CallContext` (781), `BillingPage` (749).                                                                                                                                                                |
| Q-06 | 🟡  | `PhaseReport` is imported eagerly while every other page is lazy-loaded.                                                                                                                                                                                         |
| Q-07 | 🟡  | `axios` sends an `ngrok-skip-browser-warning` header in all environments, and the request timeout is commented out.                                                                                                                                              |
| Q-08 | 🟡  | `main.tsx` falls back to a fake Google client ID if the env var is missing, which fails silently instead of loudly.                                                                                                                                              |
| Q-09 | 🟡  | `frontend/.gitignore` ignores `package-lock.json`, so dependency versions aren't reproducible.                                                                                                                                                                   |

---

## 6. Recommended priorities

1. **This week:** F-01 (sanitize HTML), Q-01 (fix the 36 TS errors so the build works), F-07 (`minPlan="basic"` on report routes), F-08 (show a toast on 403 instead of redirecting).
2. **Next:** F-03 owner guard, F-04 slug validation, F-09/F-10/F-11 permission gating, F-12/F-13 dead routes, F-14 store name/email after OTP, F-16 dynamic report dates, F-17 query invalidation.
3. **Then:** finish or hide mocked onboarding (F-15), add tests for the core flows (projects → work items, members, billing), and extract shared Kanban/tab components (Q-04).

---

## 7. Environment variables (frontend)

| Var                                                 | Purpose                    |
| --------------------------------------------------- | -------------------------- |
| `VITE_PUBLIC_API_BASE_URL`                          | REST API base URL          |
| `VITE_PUBLIC_SOCKET_URL`                            | Socket.io server           |
| `VITE_GOOGLE_CLIENT_ID`                             | Google SSO                 |
| `VITE_ICE_SERVER_URL` / `_USERNAME` / `_CREDENTIAL` | TURN/STUN for WebRTC calls |

## 8. Scripts

| Command            | Status                     |
| ------------------ | -------------------------- |
| `npm run dev`      | Vite dev server (`--host`) |
| `npm run build`    | ❌ fails at `tsc -b`       |
| `npm run lint`     | ❌ 217 errors              |
| `npm run test:run` | ✅ 125/125                 |
