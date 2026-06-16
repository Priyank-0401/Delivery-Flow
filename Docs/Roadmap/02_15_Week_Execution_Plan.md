# DeliveryFlow - 15-Week Execution Plan

**Document ID:** DF-RDM-02  
**Target Audience:** Engineering (Solo Developer)

This document breaks down the 15-week roadmap into a strict weekly cadence, restructured to prioritize flagship dependency modeling, early CI/CD, project health metrics, production deployment, and observability before integrating AI features.

---

### Week 1: Foundation & Architecture (Completed)
- **Goals:** Establish repository layouts and initial docker environments.
- **DoD:** Backend and frontend repositories initialized and compile cleanly.

### Week 2: Auth & Security Infrastructure (Completed)
- **Goals:** Secure backend filter chain, implement JWT properties, and define user role mappings.
- **DoD:** Login and Register REST APIs active with BCrypt hashing and custom tokens.

### Week 3: Core API Security & Method-Level RBAC (Completed)
- **Goals:** Secure existing routes using JWT checks and enforce strict role checking (`ADMIN > PMO > MANAGER > MEMBER`).
- **DoD:** Accessing any operational API route without a valid bearer token throws 401.

### Week 4: Request Validation, Exceptions & CI Setup (Completed)
- **Goals:** Bind input bodies to validation checks, structure standardized API responses, and implement GitHub Actions CI workflow (build, test, lint).
- **DoD:** Bad request structures throw 400, and CI automatically checks code changes.

### Week 5: Neo4j Integration & Node Mapping (Phase 2)
- **Goals:** Integrate Graph database and sync relational database writes.
- **Backend:** Connect Neo4j DB container; map task/milestone nodes via `spring-data-neo4j`.
- **Sync:** Implement Postgres-to-Neo4j transactional event listeners.
- **DoD:** Postgres task edits reflect instantly in the Neo4j graph nodes.

### Week 6: Graph Relationship & Dependency Algorithms (Phase 2)
- **Goals:** Implement topological sort and dependency checking.
- **Backend:** Code graph cycle detection validation and Slack calculations.
- **APIs:** Expose `/tasks/{id}/critical-path` and relationship mapping controls.
- **DoD:** Cycle detection prevents circular dependencies and returns zero-slack critical paths.

### Week 7: React Flow Dependency Graph UI (Phase 3)
- **Goals:** Create a visual, interactive graph dashboard.
- **Frontend:** Install `reactflow`, map fetched node lists to canvas.
- **UI:** Highlight critical path sequence red and show details in a sidebar on click.
- **DoD:** Fully interactive task node graph panel with zoom/pan functionality is active in browser.

### Week 8: Project Health Metric Snapshotting (Phase 4)
- **Goals:** Collect snapshot records for analytics.
- **Backend:** Configure cron runners to capture daily utilization, velocity, and backlog metrics.
- **Database:** Create the `health_metrics` snapshot audit tables.
- **DoD:** Snapshot jobs log database statistics and save historical trend data daily.

### Week 9: Health Score Dials & Visualizations (Phase 4)
- **Goals:** Implement the 8-dimension health calculator.
- **Backend:** Code weighted composite aggregation rules mapping 0-100 scores.
- **Frontend:** Embed speedometer dial gauges and 8-dimension radar/spider charts.
- **DoD:** Project details page displays color-coded health stats powered by real metrics.

### Week 10: Production DevOps & Deployment (Phase 5)
- **Goals:** Deploy the application to AWS under a public URL.
- **DevOps:** Setup production docker-compose profiles. Provision EC2 host. Config Nginx reverse proxy with SSL certificate.
- **DoD:** App is fully accessible via public domain HTTPS URL.

### Week 11: Production Observability (Phase 5.5)
- **Goals:** Establish deep system visibility for monitoring and diagnostics.
- **Backend:** Configure Spring Boot Actuator, Micrometer endpoints, and structured JSON request logging.
- **DoD:** Metrics collection, error tracking, and health checks are visible in production.

### Week 12: Gemini AI Insights Engine (Phase 6)
- **Goals:** Add context-grounded AI risk summaries.
- **Backend:** Integrate Gemini API and construct prompt templates embedding project metrics and dependency graph JSON.
- **DoD:** Clicking "Explain Risks" generates plain English analysis with database source citations.

### Week 13: Sprint Intelligence & Capacity Heatmaps (Phase 7)
- **Goals:** Implement workload planning widgets.
- **Frontend:** Add burndown charts and developer capacity heatmaps.
- **DoD:** Managers can drag tasks to balance workloads and avoid developer overload.

### Week 14: External Integration Webhooks (Phase 8)
- **Goals:** Feed real-time project updates from Jira or GitHub.
- **Backend:** Build webhook ingestion routes with signature validation.
- **DoD:** External task edits update Postgres and Neo4j nodes within 2 seconds.

### Week 15: Reporting, Enterprise Hierarchy & Polish (Phase 9 & 10)
- **Goals:** Automate PDF reports, implement program hierarchy CRUD, and seed demo records.
- **Backend:** PDF report generation cron, Portfolios & Programs CRUD API, and rich seeder data script.
- **DoD:** Recipient receives scheduled PDF health logs, and the repository displays 6 months of historical metrics upon first login.
