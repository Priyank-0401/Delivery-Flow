# DeliveryFlow - Comprehensive Sprint Planning & Roadmap

**Document ID:** DF-RDM-03  
**Target Audience:** Engineering (Solo Developer)

This document is the master execution blueprint for DeliveryFlow. It structures the project into a 12-sprint roadmap optimized for building a **Delivery Intelligence Platform** focused on graph-based dependency mapping and objective health metrics.

The strategic value chain is: `Security, Validation & CI → Neo4j Graph Sync → Graph Algorithms → Graph UI → Health Score Engine → Health Charts → Production Deployment → Production Observability → AI Summary Layer → Workloads Heatmap → Webhooks & PDF Reports → Enterprise CRUD & Polish`.

---

# PART 1: The 12-Sprint Execution Plan

## Sprint 1: Platform Foundation (Completed)
**Goal:** Establish the technical bedrock of the application.
- **Backend:** Spring Boot 3, PostgreSQL 15, Flyway, Swagger/OpenAPI.
- **DoD:** A booting backend that connects to a local database with Swagger documentation generated.

## Sprint 2: Core Domain, Security & CI (Completed)
**Goal:** Establish user management, database tables, the API security filter chain, and basic CI.
- **Entities & Tables:** `users`, `teams`, `team_members`, `projects`, `project_teams`, `sprints`, `tasks`, `refresh_tokens`, `audit_logs`.
- **Security:** Spring Security JWT filter, dynamic CORS, Method-level RBAC (`ADMIN > PMO > MANAGER > MEMBER`), and global validation.
- **CI/CD:** Setup GitHub Actions CI workflow (build, test, lint) for automated code checking.
- **DoD:** Secured REST endpoints with JSR-380 validation, standardized exception payloads, and automated green checks in GitHub.

## Sprint 3: Dependency Graph Foundation
**Goal:** Introduce the Neo4j Graph Database to model task linkages.
- **Database:** Spin up Neo4j database service container in Docker Compose.
- **Backend:** Configure `spring-data-neo4j` properties. Define `TaskNode` mapping entities.
- **Sync:** Implement Postgres-to-Neo4j transactional event listeners (creating/deleting Postgres tasks automatically updates Neo4j).
- **DoD:** Postgres task edits reflect instantly in the Neo4j graph nodes.

## Sprint 4: Graph Algorithms
**Goal:** Leverage graph analytics to detect circular dependencies and find the critical path.
- **Backend Algorithms:** 
  - *Circular Dependency Detection:* Implement graph cycle detection validation (such as Kahn's, Tarjan's, or DFS-based) to reject blocking links that create loops.
  - *Critical Path Detection:* Topological sort slack calculator (Earliest Start/Finish, Latest Start/Finish).
- **DoD:** API successfully calculates task sequence slack and flags the zero-slack critical path sequence.

## Sprint 5: Graph UI Visualization
**Goal:** Render the interactive dependency graph in the frontend.
- **Frontend:** Install `reactflow` and map fetched backend dependency node data to the interactive canvas.
- **UI:** Color-code critical path edges in red, style cross-team blocks as dashed lines, and show metadata details inside a slide-drawer.
- **DoD:** Visual drag-and-drop task graph is active and functional in the browser.

## Sprint 6: Project Health Scoring
**Goal:** Implement the math calculations grading project health objectively.
- **Backend:** Code the `HealthScoreCalculator` service mapping the 8 metric dimensions (Velocity, Blocker Density, Utilization, Overdue status, etc.).
- **Database:** Create the `health_metrics` snapshot audit tables to cache historical trends.
- **DoD:** Database calculates aggregated health metrics per project on demand.

## Sprint 7: Project Health Visualization
**Goal:** Render color-coded health stats across the dashboard.
- **Frontend:** Build Dial Gauges, Spider/Radar charts displaying the 8 dimensions, and 30-day trend lines.
- **DoD:** Dashboard visually represents objective health aggregates based on live metrics.

## Sprint 8: Production Deployment
**Goal:** Deploy the application to a public HTTPS URL.
- **Infrastructure:** Multi-stage Dockerfiles, AWS EC2 / Nginx TLS setup, and DNS mapping.
- **DoD:** The application compiles, passes tests, and is publicly accessible via HTTPS.

## Sprint 8.5: Production Observability
**Goal:** Establish monitoring and health diagnostics in production.
- **Backend:** Configure Spring Boot Actuator, Micrometer endpoints, health checks, and structured JSON request logging.
- **DoD:** Real-time application metrics, request logging, and error tracking are fully visible in production.

## Sprint 9: AI Insights Engine
**Goal:** Add lightweight Gemini-driven summaries explaining project statuses.
- **Backend:** Integrate Gemini API, construct grounded prompt templates embedding project metrics and dependency graph JSON.
- **DoD:** Dashboard displays a plain English summary of project risks and remediation recommendations with database source citations.

## Sprint 10: Sprint Workloads & Heatmaps
**Goal:** Manage developer capacity allocation.
- **Frontend:** Burndown/burnup charts, developer capacity matrix grids showing over-allocation.
- **DoD:** Managers can drag tasks to re-balance team workloads in the UI.

## Sprint 11: Webhooks & Reporting
**Goal:** Automate reports and external updates.
- **Backend:** Ingestion routes for Jira/GitHub webhook payloads. PDF report generator with scheduled email triggers (cron based).
- **DoD:** Project metrics update from external Jira commits, and users receive PDF health logs.

## Sprint 12: Enterprise CRUD & Polish
**Goal:** Complete advanced hierarchies and seed realistic historical records.
- **Backend:** Map Portfolios & Programs hierarchical associations and seed 6 months of historical metrics.
- **DoD:** Navigating to a demo portfolio shows a rich dataset of historical graphs on first load.

---

# PART 2: Database Schema Evolution

PostgreSQL is the source of truth for operational state, with Neo4j functioning purely as a graph computation engine.

## Current Relational Tables (Sprints 1-2)
- `users`, `teams`, `team_members`, `projects`, `project_teams`, `sprints`, `tasks`, `refresh_tokens`, `audit_logs`

## Future Relational Tables (Sprints 3-12)

### Sprint 6: Health Engine
- `health_metrics` (id, project_id, metric_type, value, recorded_at)
- `health_scores` (id, project_id, score, status, created_at)

### Sprint 9: AI Layer
- `ai_summaries` (id, project_id, summary, generated_at)

### Sprint 11: Webhooks & Reports
- `integration_configs` (id, provider, access_token, active_status)
- `report_schedules` (id, recipient, interval_cron, report_type)

## Neo4j Graph Schema (Sprint 3)
- **Nodes:** `TaskNode`, `MilestoneNode`
- **Edges:** `BLOCKS`, `RELATES_TO`

---

# PART 3: Architectural Constraints (The MVP Rules)
Do not over-engineer during the MVP. 
- **Stick to the core stack:** React, Spring Boot, Postgres, Neo4j, Gemini, AWS.
- **Avoid:** Kafka, Microservices, Kubernetes, Redis, Event Sourcing, CQRS. 
Focus on proving an understanding of how engineering organizations deliver high-value intelligence products.
