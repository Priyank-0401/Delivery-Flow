# Database Schema & Data Model: Project Health Engine

## 1. Relational Entities (PostgreSQL)

### Entity: `ProjectHealthConfig`
- **Table**: `project_health_configs`
- **Purpose**: Stores the weighting configuration coefficients for calculating the composite project health score.
- **Columns**:
  - `id` (VARCHAR(36), Primary Key)
  - `project_id` (VARCHAR(36), Unique, Not Null, FK references `projects.id`)
  - `velocity_weight` (DECIMAL(3,2), Not Null, Default 0.15)
  - `blocker_weight` (DECIMAL(3,2), Not Null, Default 0.15)
  - `defect_weight` (DECIMAL(3,2), Not Null, Default 0.10)
  - `dependency_weight` (DECIMAL(3,2), Not Null, Default 0.20)
  - `utilization_weight` (DECIMAL(3,2), Not Null, Default 0.10)
  - `stability_weight` (DECIMAL(3,2), Not Null, Default 0.10)
  - `scope_creep_weight` (DECIMAL(3,2), Not Null, Default 0.10)
  - `release_confidence_weight` (DECIMAL(3,2), Not Null, Default 0.10)
  - `created_at` (TIMESTAMP, Default CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMP, Default CURRENT_TIMESTAMP)

---

### Entity: `ProjectHealthMetric`
- **Table**: `project_health_metrics`
- **Purpose**: Stores the pre-calculated metrics for the 8 dimensions, contributing factors/explanations, and the current composite health score of a project.
- **Columns**:
  - `id` (VARCHAR(36), Primary Key)
  - `project_id` (VARCHAR(36), Unique, Not Null, FK references `projects.id`)
  - `overall_score` (INT, Not Null)
  - `velocity_score` (INT, Not Null)
  - `blocker_score` (INT, Not Null)
  - `defect_score` (INT, Not Null)
  - `dependency_score` (INT, Not Null)
  - `utilization_score` (INT, Not Null)
  - `stability_score` (INT, Not Null)
  - `scope_creep_score` (INT, Not Null)
  - `release_confidence_score` (INT, Not Null)
  - `contributing_factors` (TEXT, Nullable) -- Semi-colon or comma separated list of explanations
  - `last_calculated_at` (TIMESTAMP, Default CURRENT_TIMESTAMP)

---

### Entity: `HealthHistorySnapshot`
- **Table**: `health_history_snapshots`
- **Purpose**: Stores the historical record of project health scores taken daily.
- **Columns**:
  - `id` (VARCHAR(36), Primary Key)
  - `project_id` (VARCHAR(36), Not Null, FK references `projects.id`)
  - `score` (INT, Not Null)
  - `health_delta` (INT, Not Null, Default 0) -- Change in health since the previous snapshot
  - `snapshot_date` (DATE, Not Null)
  - `created_at` (TIMESTAMP, Default CURRENT_TIMESTAMP)

## 2. Validation & Constraints

- **Global Weights Limit**: The sum of all configuration weights in `ProjectHealthConfig` must sum up to exactly `1.0`. This is validated in the Java domain layer using a `@AssertTrue` method or custom entity lifecycle listener before saving.
- **Score Bounds**: All score metrics in `ProjectHealthMetric` must stay between `0` and `100` inclusive.
- **Snapshot Uniqueness**: The combination of `project_id` and `snapshot_date` in `health_history_snapshots` must be unique to prevent duplicate entries for a single day.
