# DeliveryFlow - Sprint Planning

**Document ID:** DF-RDM-03  
**Target Audience:** Engineering (Solo Developer)

To maintain momentum and simulate a real-world enterprise cadence, the 15-week execution plan is broken down into 7 two-week sprints, followed by a final 1-week deployment and polish sprint.

---

## Sprint 1: The Foundation (Weeks 1-2)
- **Sprint Goal:** Establish the boilerplate architecture, configure the CI pipeline locally, and secure the application via JWT.
- **Key User Stories:**
  - US-01: As a User, I want to log in using an email and password.
  - US-02: As an Admin, I want to view my profile details to verify my JWT.
- **Deliverables:** Working Spring Boot and React boilerplate. Connected local PostgreSQL database.
- **Demo Scope:** Running the React app, submitting a login form, receiving a JWT, and successfully hitting a protected `/api/v1/users/me` endpoint.

## Sprint 2: Core Domain (Weeks 3-4)
- **Sprint Goal:** Build the CRUD functionality for Projects, Teams, Sprints, and Tasks.
- **Key User Stories:**
  - US-11: As a PM, I want to create a new Project.
  - US-13: As a Delivery Manager, I want to assign a Team to a Project.
  - US-14: As a PM, I want to create a Task and assign it to a Sprint.
- **Deliverables:** Operational relational database schema for the core domain. Basic UI list views.
- **Demo Scope:** Navigating through the UI to create a Project, build a Team, and populate a Sprint with 5 Tasks.

## Sprint 3: The Graph Engine (Weeks 5-6)
- **Sprint Goal:** Integrate Neo4j and establish the dual-write capability for Task dependencies.
- **Key User Stories:**
  - US-21: As a PM, I want to create a `BLOCKS` dependency between two tasks.
  - US-27: As a System, I want to prevent the creation of a circular dependency.
- **Deliverables:** Connected Neo4j container. `spring-data-neo4j` repository layer. Event listener syncing Postgres tasks to Neo4j nodes.
- **Demo Scope:** Creating a dependency in the UI and running a Cypher query in the Neo4j browser to prove the edge was persisted.

## Sprint 4: Visualizing the Critical Path (Weeks 7-8)
- **Sprint Goal:** Build the React Flow interactive dependency graph and the Critical Path backend algorithm.
- **Key User Stories:**
  - US-23: As a Scrum Master, I want the system to highlight the Critical Path in red.
  - US-30: As a PM, I want to zoom and pan an interactive graph canvas.
- **Deliverables:** Critical Path Algorithm (DFS/Topological Sort). React Flow canvas component.
- **Demo Scope:** Changing the "due date" of an upstream task in the UI and watching the red "Critical Path" highlight dynamically shift to a new route on the canvas.

## Sprint 5: Health & Analytics (Weeks 9-10)
- **Sprint Goal:** Translate raw data into the 0-100 Project Health Score and visualize Team Workload.
- **Key User Stories:**
  - US-36: As an Exec, I want to see a 0-100 Health Score.
  - US-63: As a Delivery Manager, I want a heatmap showing overloaded developers.
- **Deliverables:** `HealthScoreCalculator` service. Cron jobs for daily metric snapshots. Dashboard UI with charting libraries (Recharts/Chart.js).
- **Demo Scope:** Showing a Project Dashboard with a 78/100 score, then "resolving" a bug in the UI and watching the score instantly recalculate to 85/100.

## Sprint 6: AI Insights Foundation (Weeks 11-12)
- **Sprint Goal:** Integrate the Gemini API and build the RAG context injection pipeline.
- **Key User Stories:**
  - US-47: As a Scrum Master, I want the AI to generate a 2-sentence explanation of why the health score dropped.
- **Deliverables:** API key configuration. LangGraph (or LangChain4j) setup. Prompt templates.
- **Demo Scope:** Clicking "Summarize Project" and displaying a generated text payload that accurately reflects the data on the screen.

## Sprint 7: Ask DeliveryFlow (Weeks 13-14)
- **Sprint Goal:** Build the conversational AI interface and prepare the application for production.
- **Key User Stories:**
  - US-52: As a Dev, I want to ask the chatbot "Who is blocking me?" and get an instant answer.
- **Deliverables:** Chatbot UI side-drawer. Conversational memory buffer. Initial Docker Compose production setup.
- **Demo Scope:** Typing a natural language query into the UI and receiving an accurate response citing a specific Jira ticket.

## Sprint 8: Ship It (Week 15)
- **Sprint Goal:** Deploy to AWS and populate the database with a massive dataset to impress recruiters.
- **Deliverables:** EC2 instance running Nginx and Docker. Populated database (10 Projects, 500 Tasks, 200 Dependencies).
- **Demo Scope:** A recruiter opening `https://deliveryflow.io` on their own laptop and exploring a fully populated, complex enterprise dashboard.
