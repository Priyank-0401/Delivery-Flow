# DeliveryFlow - 15-Week Execution Plan

**Document ID:** DF-RDM-02  
**Target Audience:** Engineering (Solo Developer)

This document breaks down the 15-week roadmap into a strict weekly cadence.

---

### Week 1: Foundation & Architecture
- **Goals:** Finalize all blueprints before writing application code.
- **Backend:** Initialize Spring Boot repository (Java 21, Gradle). Add Spring Web, Data JPA, Security dependencies.
- **Frontend:** Initialize Vite + React + TS project. Install Tailwind and Shadcn/UI.
- **Database:** Spin up local Postgres container via Docker Compose.
- **DevOps:** Setup `.gitignore` and initial GitHub repo.
- **Deliverables:** Completed SRS, Architecture Docs, initialized repos.
- **Definition of Done (DoD):** Both Frontend and Backend compile and run locally.

### Week 2: Auth & Users (Phase 1)
- **Goals:** Secure the application.
- **Backend:** Implement JWT filter chain. Create `/auth/login` and `/users/me` endpoints.
- **Frontend:** Build Login Screen. Setup React Context for user state. Protect internal routes.
- **Database:** Create `users` table.
- **Deliverables:** Working authentication flow.
- **DoD:** A user can log in and view a protected blank dashboard.

### Week 3: Projects & Teams (Phase 1)
- **Goals:** Establish the core hierarchical domain.
- **Backend:** Implement CRUD for `portfolios`, `programs`, `projects`, and `teams`.
- **Frontend:** Build Project List View and Team Management UI.
- **Database:** Create corresponding relational tables.
- **Deliverables:** Project management module.
- **DoD:** A user can create a project and assign a team to it.

### Week 4: Tasks & Sprints (Phase 1)
- **Goals:** Establish the granular units of work.
- **Backend:** Implement Task and Sprint entities. Build APIs to assign tasks to sprints.
- **Frontend:** Build a basic Kanban board or Task List UI.
- **Database:** Create `tasks` and `sprints` tables.
- **Testing:** Unit tests for Task assignment logic.
- **DoD:** Tasks can be created, edited, and moved between 'To Do' and 'Done'.

### Week 5: Neo4j Integration (Phase 2)
- **Goals:** Introduce the Graph database.
- **Backend:** Add `spring-data-neo4j`. Create NodeEntity mappings for `TaskNode`.
- **Database:** Add Neo4j to local Docker Compose.
- **DevOps:** Configure application properties to connect to dual databases.
- **Risks:** Distributed transaction failures between Postgres and Neo4j.
- **DoD:** Creating a task in Postgres automatically creates a node in Neo4j.

### Week 6: Graph Edges & Modeling (Phase 2)
- **Goals:** Connect the nodes.
- **Backend:** Build API to create `BLOCKS` and `RELATES_TO` relationships.
- **Frontend:** Build a simple form to say "Task A blocks Task B".
- **Database:** Write Cypher queries to validate edges.
- **DoD:** Edges can be successfully persisted in Neo4j.

### Week 7: Critical Path Algorithm (Phase 2)
- **Goals:** The brain of the flagship feature.
- **Backend:** Implement topological sort and Slack calculation using Cypher and Java logic.
- **Testing:** Heavy unit testing of the DAG traversal with mocked data.
- **Risks:** Infinite loops from undetected cyclic dependencies.
- **DoD:** API successfully returns the critical path for a given milestone.

### Week 8: React Flow UI (Phase 2)
- **Goals:** Visualize the graph.
- **Frontend:** Install `reactflow`. Fetch graph data from backend and map to nodes/edges on canvas.
- **UI:** Color the critical path edges red based on API response.
- **DoD:** Interactive, drag-and-drop graph is visible in the browser.

### Week 9: Analytics Aggregation (Phase 3)
- **Goals:** Start calculating metrics.
- **Backend:** Build scheduled jobs (cron) to calculate Velocity and Scope Creep per sprint.
- **Database:** Create `health_metrics` time-series table.
- **DoD:** Backend successfully aggregates and saves daily metric snapshots.

### Week 10: Health Score Engine (Phase 3)
- **Goals:** Implement the 8-dimension mathematical formula.
- **Backend:** Code the `HealthScoreCalculator` service. Weight the variables.
- **Frontend:** Build the dial gauge component for the dashboard.
- **Testing:** Validate score outputs against known mocked data sets.
- **DoD:** Dashboard displays an accurate 0-100 score.

### Week 11: Workload Analytics (Phase 3)
- **Goals:** Solve the developer burnout problem.
- **Backend:** Calculate assigned hours vs capacity.
- **Frontend:** Build the Heatmap UI for the Team page.
- **DoD:** UI highlights overloaded developers in red.

### Week 12: Gemini API Integration (Phase 4)
- **Goals:** Introduce AI.
- **Backend:** Register for Gemini API key. Add LangChain4j or raw HTTP client to Spring Boot.
- **Frontend:** Add a "Summarize Project" button.
- **Risks:** API latency causing HTTP timeouts.
- **DoD:** Backend can successfully send a hardcoded prompt and return a response.

### Week 13: RAG & Ask DeliveryFlow (Phase 4)
- **Goals:** Make the AI contextual.
- **Backend:** Construct the JSON prompt injection containing Project Health and Graph data. Implement LangGraph logic.
- **Frontend:** Build the chat interface side-drawer.
- **DoD:** The AI answers questions accurately based *only* on the current project's data.

### Week 14: Deployment (Phase 5)
- **Goals:** Ship to production.
- **DevOps:** Provision AWS EC2 (Ubuntu). Install Docker. Write production `docker-compose.yml`. Configure Nginx as a reverse proxy. Map domain name via Route53.
- **Risks:** CORS errors, Database connection failures in prod.
- **DoD:** Application is accessible via `https://deliveryflow.io`.

### Week 15: Polish & Portfolio (Phase 6)
- **Goals:** Prepare for recruiters.
- **Backend:** Write a `DemoDataSeeder` script to populate realistic, 6-month historical data into the databases.
- **DevOps:** Polish the GitHub README with architecture diagrams and setup instructions.
- **DoD:** The project looks like a thriving, active enterprise platform upon first login.
