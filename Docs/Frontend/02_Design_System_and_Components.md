# DeliveryFlow - Design System and Components

**Document ID:** DF-FE-02  
**Target Audience:** UX Designers, Frontend Engineers

DeliveryFlow must feel like a premium, enterprise-grade SaaS platform. It draws inspiration from Linear (dark mode, crisp borders, subtle glows), Atlassian (information density), and Datadog (data visualization).

---

## 1. Design System

### Theme: Dark Mode First
- The application will be designed for Dark Mode as the primary viewing experience, minimizing eye strain for Delivery Managers staring at dashboards for 8 hours a day.

### Colors (Tailwind Configuration)
We will customize the `tailwind.config.js` with semantic variables:
- **Background:** `#09090b` (Deep Zinc) - Extremely dark, almost black, to make charts pop.
- **Card/Surface:** `#18181b` (Zinc 900) - Slightly elevated surfaces.
- **Primary (Accent):** `#6366f1` (Indigo 500) - Used for primary buttons and active states.
- **Success (Health > 80):** `#10b981` (Emerald 500).
- **Warning (Health 50-80):** `#f59e0b` (Amber 500).
- **Critical (Health < 50):** `#ef4444` (Red 500) - Used for critical path edges in the graph.
- **Text:** `#f8fafc` (Slate 50) for primary, `#94a3b8` (Slate 400) for muted secondary text.

### Typography
- **Font Family:** `Inter` (Google Fonts). It provides maximum legibility for dense data tables and numbers.
- **Monospace:** `JetBrains Mono` for IDs (e.g., `PROJ-1402`) and API payloads.

### Spacing & Borders
- **Border Radius:** `0.5rem` (rounded-lg) for cards, `0.375rem` (rounded-md) for buttons. Avoid overly rounded "playful" UI.
- **Borders:** Extremely subtle 1px solid borders (`border-zinc-800`) on all cards to create separation without relying heavily on drop-shadows in dark mode.

---

## 2. Layout Architecture

### 1. Authentication Layout (`AuthLayout.tsx`)
- **Structure:** Split screen. Left 50% is a dark, abstract geometric graphic or branding panel. Right 50% is a clean, centered login form.
- **Purpose:** Provide a premium entry point devoid of internal navigation.

### 2. Main Dashboard Layout (`DashboardLayout.tsx`)
- **Structure:** 
  - **Sidebar (Left):** Fixed width (250px), collapsible to icons (64px). Contains primary navigation (Projects, Teams, Graph, Analytics).
  - **Top Navigation (Top):** Fixed height (64px). Contains breadcrumbs on the left (e.g., `Projects / Project Phoenix / Sprint 4`), global search in the center, and User Profile / Notifications on the right.
  - **Main Content Area:** Takes up remaining viewport. Uses `overflow-y-auto` to scroll independently of the navigation.

### 3. Settings Layout (`SettingsLayout.tsx`)
- **Structure:** Renders inside the Main Content Area. Features a secondary left-hand menu specific to settings (Profile, Organization, Webhooks, API Keys).

---

## 3. Global Components Inventory

These components live in `src/components/shared/` and ensure visual consistency across the entire application.

### 1. `DataTable`
- **Wrapper around:** AG Grid.
- **Props:** `columns`, `data`, `isLoading`, `onRowClick`.
- **Usage:** Used for the Projects List, Teams List, and Task Backlog. Configured with a dark theme overriding AG Grid's default styles.

### 2. `HealthScoreCard`
- **Wrapper around:** Recharts (RadialBarChart) + standard div.
- **Props:** `score` (0-100), `trend` (+5, -2).
- **Usage:** Displays a circular gauge. Automatically colors itself Red, Yellow, or Green based on the score threshold.

### 3. `RiskBadge`
- **Props:** `level` ("LOW", "MEDIUM", "HIGH", "CRITICAL").
- **Usage:** A small, pill-shaped badge with subtle background opacity (e.g., `bg-red-500/10 text-red-500` for CRITICAL) used inside tables and task cards.

### 4. `MetricCard`
- **Props:** `title`, `value`, `icon`, `subtext`.
- **Usage:** Used in the top row of dashboards (e.g., "Blocked Tasks: 7", "Velocity: 42 pts").

### 5. `LoadingState` & `EmptyState`
- **Usage:** Centralized components rendered when TanStack Query `isLoading` is true, or when data is empty. Uses Lucide icons (Spinner, Inbox) and muted text.

### 6. `ConfirmationDialog`
- **Wrapper around:** Shadcn `AlertDialog`.
- **Props:** `title`, `description`, `onConfirm`.
- **Usage:** Used globally before deleting dependencies or projects.
