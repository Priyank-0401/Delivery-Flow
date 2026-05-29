# DeliveryFlow - Database Design

**Document ID:** DF-SRS-05  
**Target Audience:** Database Administrators, Backend Engineers, Solution Architects

The primary datastore for DeliveryFlow is a relational PostgreSQL database, handling the transactional system of record for all entities except the graph topology (which is handled by Neo4j) and high-throughput time-series metrics (which may leverage TimescaleDB/Prometheus). This document outlines the Core Relational Schema.

---

## 1. Core Principles
- **Multi-Tenancy:** Every table contains a `tenant_id` for strict logical isolation using Postgres Row-Level Security (RLS).
- **Auditability:** Every table contains `created_at`, `updated_at`, `created_by`, and `updated_by`.
- **Soft Deletes:** `deleted_at` is used universally; rows are never physically deleted.

---

## 2. Table Specifications

### 2.1 Table: `users`
- **Purpose:** Stores authentication credentials, profile data, and system roles.
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `tenant_id` (UUID, Not Null, Indexed)
  - `email` (VARCHAR(255), Unique, Not Null)
  - `password_hash` (VARCHAR(255), Nullable for SSO users)
  - `role` (ENUM: 'ADMIN', 'PMO', 'MANAGER', 'MEMBER', Not Null)
- **Relationships:** Belongs to `tenant`. Has many `teams` (via join table).
- **Sample Record:** `id: "u-123", tenant_id: "t-1", email: "patricia@corp.com", role: "PMO"`

### 2.2 Table: `teams`
- **Purpose:** Represents a squad or grouping of users working together.
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `tenant_id` (UUID, Not Null)
  - `name` (VARCHAR(100), Not Null)
  - `capacity_hours_per_sprint` (INT, Default 0)
- **Relationships:** Has many `users`. Has many `projects`.
- **Sample Record:** `id: "tm-1", name: "Backend Squad A", capacity_hours_per_sprint: 320`

### 2.3 Table: `portfolios`
- **Purpose:** The highest level of organizational grouping for financial/strategic tracking.
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `name` (VARCHAR(100), Not Null)
  - `budget` (DECIMAL, Nullable)
- **Relationships:** Has many `programs`.

### 2.4 Table: `programs`
- **Purpose:** A collection of related projects aiming for a unified business outcome.
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `portfolio_id` (UUID, Foreign Key)
  - `name` (VARCHAR(100), Not Null)
- **Relationships:** Belongs to `portfolio`. Has many `projects`.

### 2.5 Table: `projects`
- **Purpose:** The core unit of delivery. Often maps 1:1 with a Jira Project.
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `program_id` (UUID, Foreign Key, Nullable)
  - `external_reference_id` (VARCHAR(100), Nullable - e.g., 'Jira-PRJ-1')
  - `name` (VARCHAR(100), Not Null)
  - `status` (ENUM: 'ACTIVE', 'COMPLETED', 'ARCHIVED')
- **Relationships:** Has many `sprints`, `tasks`, `health_metrics`.
- **Sample Record:** `id: "p-1", name: "Q3 Mobile App", status: "ACTIVE"`

### 2.6 Table: `sprints`
- **Purpose:** Time-boxed iterations within a project.
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `project_id` (UUID, Foreign Key)
  - `name` (VARCHAR(100), Not Null)
  - `start_date` (TIMESTAMP)
  - `end_date` (TIMESTAMP)
  - `status` (ENUM: 'PLANNED', 'ACTIVE', 'CLOSED')
- **Relationships:** Belongs to `project`. Has many `tasks`.

### 2.7 Table: `tasks`
- **Purpose:** The granular unit of work (Epic, Story, Bug).
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `project_id` (UUID, Foreign Key)
  - `sprint_id` (UUID, Foreign Key, Nullable)
  - `assignee_id` (UUID, Foreign Key, Nullable)
  - `title` (VARCHAR(255), Not Null)
  - `status` (VARCHAR(50), Not Null - e.g., 'To Do', 'In Progress', 'Done')
  - `story_points` (INT, Nullable)
- **Relationships:** Relates to `users` (assignee). Syncs to Graph DB as Nodes.

### 2.8 Table: `dependencies`
- **Purpose:** Relational backup/mirror of the Graph DB edges for reporting purposes.
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `source_task_id` (UUID, Foreign Key)
  - `target_task_id` (UUID, Foreign Key)
  - `type` (ENUM: 'BLOCKS', 'RELATES_TO')
- **Relationships:** Links two `tasks`.

### 2.9 Table: `health_metrics`
- **Purpose:** Time-series snapshot of project health scores for trendlines.
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `project_id` (UUID, Foreign Key)
  - `calculated_at` (TIMESTAMP, Indexed)
  - `overall_score` (DECIMAL)
  - `velocity_score` (DECIMAL)
  - `blocker_score` (DECIMAL)
- **Relationships:** Belongs to `project`.

### 2.10 Table: `risks`
- **Purpose:** Identified risks (either AI-generated or human-logged).
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `project_id` (UUID, Foreign Key)
  - `risk_type` (VARCHAR(50))
  - `probability_score` (DECIMAL)
  - `description` (TEXT)
  - `status` (ENUM: 'OPEN', 'MITIGATED')

### 2.11 Table: `reports`
- **Purpose:** Metadata for saved or scheduled executive reports.
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `creator_id` (UUID, Foreign Key)
  - `title` (VARCHAR(100))
  - `schedule_cron` (VARCHAR(50), Nullable)
  - `format` (ENUM: 'PDF', 'EXCEL')

### 2.12 Table: `notifications`
- **Purpose:** In-app and push notification queue.
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key)
  - `message` (TEXT)
  - `is_read` (BOOLEAN, Default false)
  - `link_url` (VARCHAR(255))

### 2.13 Table: `integrations`
- **Purpose:** Webhook and API key configurations for external tools (Jira, GitHub).
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `tenant_id` (UUID, Foreign Key)
  - `provider` (ENUM: 'JIRA', 'GITHUB', 'SLACK')
  - `access_token` (VARCHAR(500), Encrypted)
  - `webhook_secret` (VARCHAR(255))

### 2.14 Table: `audit_logs`
- **Purpose:** Immutable ledger of all write actions for compliance (SOC2).
- **Attributes:**
  - `id` (UUID, Primary Key)
  - `tenant_id` (UUID, Foreign Key)
  - `actor_id` (UUID, Foreign Key)
  - `action` (VARCHAR(100))
  - `resource_type` (VARCHAR(50))
  - `resource_id` (UUID)
  - `ip_address` (VARCHAR(45))
  - `timestamp` (TIMESTAMP)
