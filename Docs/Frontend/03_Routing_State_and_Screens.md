# DeliveryFlow - Routing, State, and Screens

**Document ID:** DF-FE-03  
**Target Audience:** Frontend Engineers

This document defines the structural plumbing of the frontend, detailing how data flows, how URLs map to views, and the exact implementation plan for the Phase 1 MVP screens.

---

## 1. Routing Structure

We use a declarative route tree leveraging React Router's nested layouts.

```text
/                       -> Redirects to /login if unauthenticated, else /dashboard
/login                  -> (AuthLayout) -> LoginPage
/dashboard              -> (DashboardLayout)
  ├── /                 -> DashboardHome (Aggregate metrics)
  ├── /projects         -> ProjectListPage
  ├── /projects/:id     -> ProjectDetailsWrapper (Nested Layout for Tabs)
      ├── /tasks        -> ProjectTasksTab
      ├── /graph        -> DependencyGraphTab (React Flow)
      └── /risks        -> RiskAnalysisTab (AI Summaries)
  ├── /teams            -> TeamsListPage
  ├── /reports          -> ExecutiveReportsPage
  └── /settings         -> (SettingsLayout) -> GeneralSettings
```

---

## 2. Zustand State Management Plan

Zustand is used strictly for global client state.

### 1. `useAuthStore`
- **State:** `token: string | null`, `user: User | null`
- **Actions:** `login(token, user)`, `logout()`
- **Persistence:** Uses Zustand's `persist` middleware to save the JWT to `localStorage` securely.

### 2. `useUIStore`
- **State:** `isSidebarCollapsed: boolean`, `theme: 'dark' | 'light'`, `activeModal: string | null`
- **Actions:** `toggleSidebar()`, `setTheme(theme)`, `openModal(modalId)`, `closeModal()`

### 3. `useProjectContextStore`
- **State:** `selectedProjectId: string | null`
- **Purpose:** When a user clicks a project in the sidebar, this store holds the ID globally so the TopNav breadcrumbs and global "Ask DeliveryFlow" AI agent know which project context to query.

---

## 3. Phase 1 Screens Implementation Plan

This is the exact sequence and requirement list to build the foundational UI. No business logic (Neo4j, AI) is built yet.

### Screen 1: Login Page
- **UI Sections:** Split screen. Branding left, form right.
- **Components:** Shadcn `Card`, `Input`, `Button`, `Label`.
- **State:** Local component state for `email` and `password`.
- **Mock Data:** Hardcoded submission that calls `useAuthStore.login('mock-token', mockUser)` and routes to `/dashboard`.

### Screen 2: Dashboard Shell (Layout)
- **UI Sections:** Wrapper component managing the CSS Grid for Sidebar, TopNav, and Main Content.
- **Components:** `Sidebar`, `TopNavigation`, `<Outlet />`.
- **State:** Subscribes to `useUIStore.isSidebarCollapsed` to dynamically adjust the grid columns (`grid-cols-[250px_1fr]` vs `grid-cols-[64px_1fr]`).

### Screen 3: Sidebar
- **UI Sections:** Logo area, Navigation links (Dashboard, Projects, Teams), Footer (Settings).
- **Components:** Lucide Icons (LayoutDashboard, Folder, Users, Settings).
- **State:** Uses `useLocation` from React Router to highlight the active link with an Indigo background glow.

### Screen 4: Top Navigation
- **UI Sections:** Breadcrumbs (Left), Global Search Input (Center), User Avatar (Right).
- **Components:** Shadcn `Avatar`, `DropdownMenu` (for Logout), `Input` (for search).
- **State:** Clicking "Logout" in the dropdown calls `useAuthStore.logout()`.

### Screen 5: Project List Page
- **UI Sections:** Page Header (Title + "Create Project" button), MetricCards row (Total Projects, At Risk), Main DataTable.
- **Components:** `MetricCard` (x3), `DataTable`, `StatusBadge`.
- **Mock Data Requirement:** A hardcoded array of 5 projects to populate the table while the backend is being built.
- **State Requirements:** Setup the TanStack Query hook `useProjects()` which currently just returns a `Promise.resolve(mockData)`.

---

## 4. Development Sequence & Deliverables

To execute Phase 1 efficiently, build in this exact order:

1. **Step 1: Scaffolding.** Execute Vite and Tailwind commands. Setup absolute paths (`@/*`).
2. **Step 2: Routing & Auth.** Create the Router, `AuthLayout`, `LoginPage`, and `useAuthStore`. Prove you can "log in" and hit a protected route.
3. **Step 3: The Shell.** Build the `DashboardLayout`, `Sidebar`, and `TopNavigation`. Prove navigation works without page reloads.
4. **Step 4: The Design System.** Install Shadcn components (Button, Input, Table, Card). Configure the dark mode color tokens in Tailwind.
5. **Step 5: The Screens.** Build the `ProjectListPage` using mock data and AG Grid / Shadcn Table.

**Deliverable Achieved:** A visually stunning, highly scalable frontend shell that feels like a real enterprise product, ready to be wired up to the Spring Boot REST APIs.
