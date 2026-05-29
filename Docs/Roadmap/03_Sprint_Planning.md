# DeliveryFlow - Comprehensive Sprint Planning & Roadmap

**Document ID:** DF-RDM-03  
**Target Audience:** Engineering (Solo Developer)

This document is the master execution blueprint for DeliveryFlow. It completely structures the project into a 12-sprint roadmap optimized for building a **Delivery Intelligence Platform**. 

The strategic value chain is: `CRUD → Demo Data → Analytics → Dashboard → Health Engine → Neo4j Graph → Risk Engine → AI`.

---

# PART 1: The 12-Sprint Execution Plan

## Sprint 1: Platform Foundation (Completed)
**Goal:** Establish the technical bedrock of the application.
- **Backend:** Spring Boot 3, PostgreSQL 15, Flyway, Swagger/OpenAPI.
- **Architecture:** Package-by-feature structure.
- **Deliverables:** A booting backend that connects to a local database with Swagger documentation generated.

## Sprint 2: Core Domain (Completed)
**Goal:** Establish the operational database layer and core CRUD capabilities.
- **Entities & Tables:** `users`, `teams`, `team_members`, `projects`, `project_teams`, `sprints`, `tasks`.
- **Core Status Enums:** `TaskStatus`, `ProjectStatus`, `SprintStatus` formally defined in code.
- **Relationships:** Many-to-Many for Users↔Teams and Projects↔Teams. One-to-Many for Project→Sprints and Sprint→Tasks.
- **Deliverables:** Fully functional CRUD REST APIs with DTOs and Mappers, verified via Swagger.

## Sprint 3: Frontend CRUD Integration & Demo Data
**Goal:** Replace Swagger with a functional UI and populate the system with realistic data to power future analytics.
- **Frontend Pages:**
  - `Projects:` List Projects (AG Grid), Create Project (Dialog), View Project.
  - `Teams:` List Teams (AG Grid), Create Team, Assign Members.
  - `Sprints:` List Sprints, Create Sprint.
  - `Tasks:` List Tasks, Create Task, Assign User.
- **Demo Data Seeder (Backend):** Automatically generate **20 Users, 6 Teams, 15 Projects, 45 Sprints, and 500 Tasks** upon application boot.
- **Deliverables:** Ability to navigate the entire operational lifecycle of DeliveryFlow strictly through the React UI with a rich, believable dataset loaded.

## Sprint 4: Analytics Foundation
**Goal:** Transition from basic data storage to business intelligence. Establish historical tracking.
- **Backend Module:** `analytics`
- **Metrics Calculated:**
  - *Project Metrics:* Total Tasks, Completed Tasks, Blocked Tasks, Overdue Tasks, High Priority Tasks, Completion %.
  - *Team Metrics:* Total Members, Assigned Tasks, Capacity Utilization.
  - *Sprint Metrics:* Total Story Points, Completed Story Points, Remaining Story Points.
- **Deliverables:** Robust Analytics APIs returning detailed JSON DTOs, and cron jobs to snapshot daily historical data (daily completion %, daily blocked tasks, daily utilization) to enable trend graphs.

## Sprint 5: Executive Dashboard
**Goal:** Build the flagship UI. Make the product visually impressive and recruiter-ready.
- **Frontend Views:**
  - `Global Dashboard:` High-level view of all Projects, Teams, and overall Completion Rates.
  - `Project Details Dashboard:` `/projects/{id}` view combining operational task lists with analytical widgets.
- **Components:** Metric Cards and Recharts (Trend Graphs, Task Status Distribution, Team Utilization, Project Completion Donuts).
- **Deliverables:** A rich, interactive dashboard fully wired to the Sprint 4 Analytics APIs.

## Sprint 5.5: Data Export
**Goal:** A mini-phase to prove DeliveryFlow is built for real business users (PMs and Delivery Managers).
- **Features:** Export Project Report, Export Risk Report.
- **Deliverables:** Ability to download key dashboards and tables as CSV and PDF.

## Sprint 6: Health Engine
**Goal:** Move to prescriptive analytics. Algorithmically grade projects and teams.
- **Health Dimensions:** Task Completion, Blocked Tasks, Overdue Tasks, Unassigned Tasks, Sprint Progress, Team Utilization, Priority Tasks, Project Activity.
- **Backend:** `HealthEngineService` (initially calculated dynamically on-the-fly, architected for future caching).
- **Design Note for Sprint 9:** Begin designing inputs for the Risk Engine here (Health Score, Blocked Tasks, Critical Path Length, Overdue Tasks).
- **Output:** `{"healthScore": 82, "status": "HEALTHY"}` (Color-coded: Green, Yellow, Red).
- **Deliverables:** Visual health badging integrated across all Dashboard and Project views, plus daily health score snapshots.

## Sprint 7: Neo4j Foundation
**Goal:** Introduce the Graph Database to handle complex relationships that relational databases struggle with.
- **Backend:** `spring-data-neo4j` integration.
- **Graph Schema:** `Task Nodes` connected by `BLOCKS` relationships. Dual-write sync with PostgreSQL.
- **Deliverables:** APIs to Create, Store, and Delete dependencies between tasks (e.g., `AUTH-1` BLOCKS `API-2`).

## Sprint 8: Graph Intelligence
**Goal:** Leverage Neo4j algorithms to provide advanced project management insights.
- **Algorithms:**
  - *Critical Path Detection:* Find the longest sequence of dependent tasks.
  - *Circular Dependency Detection:* Prevent impossible task chains.
  - *Bottleneck Detection:* Identify tasks blocking the most downstream work.
- **Deliverables:** Visual dependency graphs in the UI (React Flow) highlighting the Critical Path in red.

## Sprint 9: Risk Engine
**Goal:** Automatically assess and predict project failure risks based on the inputs designed in Sprint 6.
- **Core Status Enum:** `RiskLevel` formally defined.
- **Backend:** `RiskEngineService`.
- **Logic:** Combine Health Scores + Graph Intelligence (e.g., Risk = HIGH because: 4 blocked tasks, 2 overdue sprints, Team overloaded, Critical Path delayed).
- **Deliverables:** Risk Assessment APIs and UI alerts on the Executive Dashboard.

## Sprint 10: AI Layer
**Goal:** Integrate Large Language Models (Gemini) to explain the data.
- **Features:** 
  - Executive Summaries: "Translate this project's status into a 2-paragraph email."
  - Risk Explanation: "Why is this project failing in plain English?"
- **Deliverables:** Generative text components integrated into the Project Details Dashboard.

## Sprint 11: Ask DeliveryFlow
**Goal:** Conversational intelligence interface.
- **Features:** Chat UI side-drawer. 
- **Capabilities:** User asks "Who is blocking me?" and AI queries the Neo4j graph and PostgreSQL data to answer accurately.
- **Deliverables:** A fully functional Chatbot assistant.

## Sprint 12: Deployment & Final Polish
**Goal:** Productionize the application for portfolio showcase.
- **Infrastructure:** Docker Compose production setup, AWS EC2 / Vercel deployment.
- **Deliverables:** A live, publicly accessible URL (`https://deliveryflow.io`) running the Demo Data Seeder for instant recruiter impact.

---

# PART 2: Database Schema Evolution

The database strategy utilizes PostgreSQL as the source of truth for operational and analytical state, with Neo4j functioning purely as a graph computation engine.

## Current Relational Tables (Sprints 1-3)
*The Operational Layer*
- `users`, `teams`, `team_members`, `projects`, `project_teams`, `sprints`, `tasks`, `flyway_schema_history`

## Future Relational Tables (Sprints 4-10)
*The Intelligence Layer*

### Sprint 4: Analytics
- `analytics_snapshots` (id, project_id, total_tasks, completed_tasks, blocked_tasks, completion_rate, created_at)
  - *Purpose: Daily snapshots to capture historical trends over time (Velocity, Utilization).*

### Sprint 6: Health Engine
- `health_scores` (id, project_id, score, status, created_at)
  - *Purpose: Daily health history auditing.*

### Sprint 8: Graph Intelligence (Optional Audit)
- `dependency_audit` (id, task_id, action, created_at)

### Sprint 9: Risk Engine
- `risk_assessments` (id, project_id, risk_score, risk_level, reason, created_at)

### Sprint 10 & 11: AI Layer
- `ai_summaries` (id, project_id, summary, generated_at)
- `ai_conversations` (id, project_id, user_prompt, ai_response, created_at)

## Neo4j Graph Database
*No relational tables used. Operates strictly on Nodes and Edges.*
- **Nodes:** `Task`, `Milestone`
- **Edges (Relationships):** `BLOCKS`, `TARGETS`

---

# PART 3: Architectural Constraints (The MVP Rules)
Do not over-engineer during the MVP. 
- **Stick to the core stack:** React, Spring Boot, Postgres, Neo4j, Gemini, AWS.
- **Avoid:** Kafka, Microservices, Kubernetes, Redis, Event Sourcing, CQRS. 
The current stack introduces more than enough complexity for a flagship student/portfolio project. Focus on proving an understanding of how engineering organizations actually deliver software.
