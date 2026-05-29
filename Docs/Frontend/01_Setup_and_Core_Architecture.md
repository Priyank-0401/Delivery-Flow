# DeliveryFlow - Setup and Core Architecture

**Document ID:** DF-FE-01  
**Target Audience:** Frontend Engineers

This document provides the foundational setup commands and structural architectural decisions required to build a scalable, enterprise-grade React application for DeliveryFlow.

---

## 1. Project Setup Commands

Execute these commands in the terminal in this exact order to scaffold the foundation:

```bash
# 1. Scaffold Vite Project
npm create vite@latest deliveryflow-web -- --template react-ts
cd deliveryflow-web

# 2. Install TailwindCSS & Dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Configure Path Aliases in tsconfig.json and vite.config.ts (required for Shadcn)
npm install -D @types/node

# 4. Initialize Shadcn/UI (Select Default, Slate, CSS variables: true)
npx shadcn-ui@latest init

# 5. Install Routing & State Management
npm install react-router-dom zustand

# 6. Install TanStack Query (Server State)
npm install @tanstack/react-query @tanstack/react-query-devtools

# 7. Install Data Visualization Libraries
npm install reactflow recharts ag-grid-react ag-grid-community

# 8. Install Iconography & Utilities
npm install lucide-react clsx tailwind-merge axios date-fns
```

---

## 2. Folder Structure

We use a **Feature-Sliced Design (FSD)** hybrid. This prevents the "colocation nightmare" where a single `components` folder holds 500 unrelated files.

```text
src/
├── app/              # Application initialization, global providers (QueryClient, AuthContext)
├── assets/           # Static assets (images, fonts)
├── components/       # Global, reusable UI components (Buttons, Inputs, Cards)
│   ├── ui/           # -> Shadcn generated components go here
│   └── shared/       # -> Custom global components (RiskBadge, LoadingState)
├── features/         # Feature-based modules (The core of the architecture)
│   ├── projects/     # -> components/, api/, hooks/, types/ specific to Projects
│   ├── graph/        # -> components/, api/, hooks/, types/ specific to Neo4j Graph
│   └── analytics/    # -> Health scores, charts
├── hooks/            # Global custom hooks (e.g., useDebounce, useWindowSize)
├── layouts/          # Page wrappers (AuthLayout, DashboardLayout)
├── routes/           # Route definitions and lazy loading wrappers
├── services/         # API layer (Axios config, interceptors)
├── store/            # Global Zustand stores (AuthStore, UIStore)
├── types/            # Global TypeScript types and interfaces
└── utils/            # Pure helper functions (formatDate, calculatePercentage)
```
*Purpose:* By isolating complex domains (like the `graph` canvas) into the `features` folder, the rest of the application remains pristine and decoupled.

---

## 3. Application Architecture

### Routing Architecture
- **Tool:** `react-router-dom` (v6 data routers).
- **Decision:** Use nested routing. The `DashboardLayout` will act as an Outlet wrapper, ensuring the Sidebar and TopNav do not re-render when switching between the Projects list and the Team list. 
- **Performance:** Lazy load route components using `React.lazy()` to split the massive `reactflow` and `ag-grid` bundles out of the initial load.

### State Management Architecture
- **Server State (TanStack Query):** Handles 90% of state. Any data that lives in Postgres/Neo4j is managed here. Handles caching, background refetching, and loading/error states.
- **Client State (Zustand):** Handles the remaining 10%. Used purely for UI state (e.g., Is the sidebar collapsed? Is dark mode active?) and the Auth token.
- **Decision:** Do NOT put API responses into Zustand. 

### Feature Module Architecture
- Features must be isolated. The `projects` feature cannot import directly from the internal files of the `graph` feature. They communicate by importing strictly exported types and components.

---

## 4. API Layer Architecture

The API layer must intercept requests to attach JWTs and intercept responses to handle 401 Unauthorized errors gracefully.

### Folder Structure
```text
src/services/
├── api.ts            # Axios instance configuration
├── endpoints.ts      # String constants for API paths
└── auth.interceptor.ts # Token injection logic
```

### Axios Configuration Design
1. **Base Instance:** Create an `axios.create()` instance with a configurable `baseURL` from `.env`.
2. **Request Interceptor:** Reads the JWT from `Zustand` (or localStorage) and attaches it to the `Authorization: Bearer` header.
3. **Response Interceptor:** 
   - On `2xx`: Returns `response.data`.
   - On `401 Unauthorized`: Triggers a Zustand action to clear the local session and redirect the user to `/login` automatically.
   - On `500 Server Error`: Triggers a global toast notification.

This guarantees that UI components never handle raw HTTP errors directly.
