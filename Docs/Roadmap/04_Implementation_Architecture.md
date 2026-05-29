# DeliveryFlow - Implementation Architecture Roadmap

**Document ID:** DF-RDM-04  
**Target Audience:** Engineering (Solo Developer)

This document details *how* the architectural complexity of DeliveryFlow will evolve over the 15-week timeline. We intentionally avoid starting with a complex Microservices architecture to maximize completion probability.

---

## Phase 1: The Monolithic Core (Weeks 1-4)
At the start, the priority is domain modeling and speed of delivery.

### Backend Evolution
- **Structure:** Standard MVC Spring Boot application.
- **Data Flow:** Controllers -> Services -> Repositories -> PostgreSQL.
- **Package Structure:** 
  ```text
  com.deliveryflow
  ├── config/
  ├── auth/
  ├── projects/
  ├── tasks/
  └── exceptions/
  ```
- **Architectural Debt Incurred:** High coupling between `projects` and `tasks` is allowed initially to speed up CRUD development.

### Frontend Evolution
- **Structure:** React SPA with Vite.
- **State:** Simple React Context for Auth. Prop drilling for basic CRUD components.
- **Styling:** Tailwind utility classes directly in components.

---

## Phase 2: The Modular Monolith (Weeks 5-10)
As Neo4j and the Health Engine are introduced, the codebase will become unwieldy if left as a standard monolith.

### Backend Evolution
- **Structure:** Transition to a Modular Monolith using `Spring Modulith`.
- **Data Flow:** Internal domains must now communicate via Spring Application Events rather than direct bean injection.
  - *Example:* When `TaskService` updates a task, it fires a `TaskUpdatedEvent`. The `GraphService` listens for this event to update Neo4j asynchronously.
- **Package Structure:**
  ```text
  com.deliveryflow
  ├── core/          (Auth, Shared Utils)
  ├── pmo/           (Projects, Sprints, Postgres)
  ├── intelligence/  (Neo4j, Critical Path Math)
  └── analytics/     (Health Scores, Time-series data)
  ```
- **Architectural Debt Repaid:** We decouple the Relational domain from the Graph domain.

### Frontend Evolution
- **Structure:** Introduce **TanStack Query** (React Query) for server state management.
- **State:** Replace `useEffect` fetching with React Query hooks to handle caching, background refetching, and pagination for the massive graph payloads.
- **Styling:** Standardize Shadcn/UI components to ensure the dashboard looks cohesive.

---

## Phase 3: The AI & Async Layer (Weeks 11-15)
To support RAG and long-running AI queries, the system must adopt asynchronous patterns.

### Backend Evolution
- **Structure:** Introduce `@Async` thread pools in Spring Boot.
- **Data Flow:** The `AI_Service` takes the user's prompt, queries the `pmo` module for task data, queries the `intelligence` module for graph data, builds a massive JSON context window, and calls the Gemini API.
- **Resilience:** Implement Resilience4j (Circuit Breakers) around the Gemini API calls. If the LLM times out, the system must gracefully fail without crashing the main thread.

### Frontend Evolution
- **Structure:** Implement WebSockets or Server-Sent Events (SSE) for the AI Chat interface to support streaming text responses (like ChatGPT).
- **Data Flow:** The heavy React Flow graph canvas is wrapped in `React.memo` to prevent re-rendering when the AI chat drawer is opened.

---

## Phase 4 (Post-MVP): Microservice Readiness
*Note: This is beyond the 15-week timeline, but architected for.*
Because we utilized Spring Modulith and Event-Driven internal communication in Phase 2, splitting the `intelligence` module into its own standalone deployed Microservice in the future requires minimal refactoring. The internal Spring Events simply get swapped out for Kafka topics.
