# DeliveryFlow - API Design Specification

**Document ID:** DF-SRS-06  
**Target Audience:** Frontend Engineers, Backend Engineers, Integrations Team

DeliveryFlow utilizes a RESTful API architecture using JSON payloads. All endpoints require an Authorization header (`Bearer <JWT>`) except for `/auth/login` and `/integrations/webhook/*`. 

---

## 1. Authentication & Users (4 APIs)

**1.1 POST `/api/v1/auth/login`**
- **Purpose:** Authenticate user.
- **Request:** `{ "email": "user@corp.com", "password": "pwd" }`
- **Response (200):** `{ "token": "jwt...", "user": { "id": "u-1", "role": "PMO" } }`
- **Error (401):** `{ "error": "Invalid credentials" }`

**1.2 POST `/api/v1/auth/sso/saml`**
- **Purpose:** SAML ACS endpoint for corporate identity providers.

**1.3 GET `/api/v1/users/me`**
- **Purpose:** Fetch current user profile and permissions.
- **Response (200):** `{ "id": "u-1", "email": "user@corp.com", "permissions": ["VIEW_ALL_PROJECTS"] }`

**1.4 GET `/api/v1/users`**
- **Purpose:** List users in tenant (Admin only).

---

## 2. Projects & Portfolios (6 APIs)

**2.1 POST `/api/v1/projects`**
- **Purpose:** Create a new project.
- **Request:** `{ "name": "Mobile Q3", "program_id": "prog-1" }`
- **Response (201):** `{ "id": "p-1", "name": "Mobile Q3", "status": "ACTIVE" }`

**2.2 GET `/api/v1/projects`**
- **Purpose:** List projects.
- **Response (200):** `{ "data": [ { "id": "p-1", "name": "Mobile Q3" } ], "meta": { "total": 1 } }`

**2.3 GET `/api/v1/projects/{projectId}`**
- **Purpose:** Get project details.

**2.4 PUT `/api/v1/projects/{projectId}`**
- **Purpose:** Update project settings.

**2.5 GET `/api/v1/portfolios`**
- **Purpose:** List all portfolios.

**2.6 GET `/api/v1/programs`**
- **Purpose:** List programs within a portfolio.

---

## 3. Teams & Workload (4 APIs)

**3.1 POST `/api/v1/teams`**
- **Purpose:** Create a team.
- **Request:** `{ "name": "Backend Squad A", "capacity_hours": 320 }`

**3.2 GET `/api/v1/teams/{teamId}`**
- **Purpose:** Get team details.

**3.3 GET `/api/v1/teams/{teamId}/workload`**
- **Purpose:** Get current capacity vs utilization metrics for the active sprint.
- **Response (200):** `{ "utilization_percentage": 115, "assigned_hours": 368, "capacity_hours": 320 }`

**3.4 POST `/api/v1/teams/{teamId}/members`**
- **Purpose:** Add users to a team.

---

## 4. Tasks & Sprints (4 APIs)

**4.1 GET `/api/v1/projects/{projectId}/tasks`**
- **Purpose:** List tasks in a project.

**4.2 POST `/api/v1/tasks`**
- **Purpose:** Manually create a task (usually synced via webhook instead).

**4.3 GET `/api/v1/projects/{projectId}/sprints`**
- **Purpose:** List sprints.

**4.4 GET `/api/v1/sprints/{sprintId}/burndown`**
- **Purpose:** Fetch time-series data for rendering the burndown chart.
- **Response (200):** `{ "days": [ { "date": "2026-05-01", "ideal": 100, "actual": 90 } ] }`

---

## 5. Graph & Dependency Engine (4 APIs)

**5.1 GET `/api/v1/projects/{projectId}/graph`**
- **Purpose:** Fetch the node/edge JSON required to render the interactive dependency graph.
- **Response (200):** `{ "nodes": [ { "id": "t-1", "label": "API-402" } ], "edges": [ { "source": "t-1", "target": "t-2", "type": "BLOCKS" } ] }`

**5.2 POST `/api/v1/tasks/{taskId}/dependencies`**
- **Purpose:** Create a manual dependency link.
- **Request:** `{ "target_task_id": "t-2", "type": "BLOCKS" }`

**5.3 GET `/api/v1/tasks/{taskId}/critical-path`**
- **Purpose:** Return the calculated critical path extending from this task.

**5.4 DELETE `/api/v1/dependencies/{dependencyId}`**
- **Purpose:** Remove a dependency link.

---

## 6. Project Health & Risk Engine (4 APIs)

**6.1 GET `/api/v1/projects/{projectId}/health`**
- **Purpose:** Fetch the real-time calculated health score and dimensional breakdown.
- **Response (200):** `{ "overall_score": 79.2, "dimensions": { "velocity": 88, "blockers": 80, ... } }`

**6.2 GET `/api/v1/projects/{projectId}/health/history`**
- **Purpose:** Fetch a 30-day array of health scores for trendline charts.

**6.3 GET `/api/v1/projects/{projectId}/risks`**
- **Purpose:** List all active algorithmic risks.
- **Response (200):** `{ "data": [ { "id": "r-1", "description": "Release likely delayed by 14 days", "probability": 0.92 } ] }`

**6.4 PUT `/api/v1/risks/{riskId}/mitigate`**
- **Purpose:** Mark a risk as mitigated.

---

## 7. AI Insights Engine (2 APIs)

**7.1 POST `/api/v1/ai/insights/generate`**
- **Purpose:** Trigger the RAG pipeline to generate a natural language summary of a project's state.
- **Request:** `{ "project_id": "p-1", "context_window": "30_days" }`
- **Response (200):** `{ "summary": "Project is at risk.", "root_cause": "Backend blocked.", "recommendations": [...] }`

**7.2 POST `/api/v1/ai/chat`**
- **Purpose:** Conversational interface for querying project data.
- **Request:** `{ "prompt": "Why is the Q3 launch delayed?" }`
- **Response (200):** `{ "reply": "The Q3 launch is delayed because..." }`

---

## 8. Integrations & Webhooks (2 APIs)

**8.1 POST `/api/v1/integrations/webhook/jira`**
- **Purpose:** Ingress endpoint for Jira webhooks. Unauthenticated natively, validated via HMAC signature.
- **Request:** Standard Jira Webhook JSON.
- **Response (202):** `{ "status": "Accepted for processing" }`

**8.2 GET `/api/v1/integrations/status`**
- **Purpose:** Check the sync health of connected systems.
