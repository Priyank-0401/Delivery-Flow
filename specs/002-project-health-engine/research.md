# Research & Architectural Decisions: Project Health Engine

## 1. Multi-Dimensional Health Aggregation

### Decision
We will implement the project health calculation as a single service `HealthCalculationService` that pulls metrics from separate module boundaries (Velocity, Tasks, Defects, Dependencies, Sprints, Capacity) and aggregates them programmatically on-demand.

### Rationale
By aggregating these values in a single service layer using service interfaces, we avoid cross-database joins and maintain strict module separation. It allows the health engine to adapt if individual modules are refactored or extracted in the future.

### Alternatives Considered
- **Database Views**: Performing joins across projects, sprints, tasks, and members at the SQL level. Rejected because it violates package modularity and makes database engine migration or schema updates difficult.

---

## 2. Daily Snapshot Scheduling

### Decision
We will use Spring's `@Scheduled` annotation to run a cron job at midnight daily, using a simple transactional update loop to compute and save `HealthHistorySnapshot` entities for all active projects.

### Rationale
Spring Scheduler is built into the Spring framework, requires no external infrastructure (like Quartz or Hangfire), and is lightweight. For a modular monolith scale, a single daily scheduler running in a clustered environment with simple database synchronization is sufficient.

### Alternatives Considered
- **Quartz Scheduler**: Too heavy for simple daily snapshots.
- **External Cron Trigger**: Requires configuring AWS CloudWatch events or Kubernetes CronJobs, introducing operational overhead.

---

## 3. Data Staleness Decay Logic

### Decision
We will check the most recent event timestamp from the `activity_events` table associated with the project. If `LocalDateTime.now()` is more than 72 hours (excluding weekends) after the last activity event, we will deduct `5 * (days - 3)` points from the computed composite health score.

### Rationale
The `activity_events` table already tracks all significant events (sprint updates, task status changes, commits, project creation). Relying on this audit log is highly accurate and un-gameable.

---

## 4. Frontend Visualization Library

### Decision
We will use **Recharts** to render both the multi-dimensional radar/spider chart for the current health grade and the line chart for the 30-day health history trendline.

### Rationale
Recharts is already installed in our React application's `package.json`, has high compatibility with TailwindCSS layout styling, and supports responsive rendering.

### Alternatives Considered
- **Chart.js / React-Chartjs-2**: Requires extra dependencies and has a heavier bundle size.
