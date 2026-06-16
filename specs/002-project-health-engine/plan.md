# Implementation Plan: Project Health Engine

**Branch**: `002-project-health-engine` | **Date**: June 16, 2026 | **Spec**: [specs/002-project-health-engine/spec.md](spec.md)

**Input**: Feature specification from `/specs/002-project-health-engine/spec.md`

## Summary

The Project Health Engine will calculate an objective, real-time health grade (0-100 score) for projects based on a composite formula of 8 dimensions: Velocity Consistency, Blocker Density, Defect Leakage, Dependency Risk, Team Utilization, Sprint Stability, Scope Creep, and Release Confidence. We will implement this as a modular sub-system (`health`) within our backend monolith, accompanied by a daily database cron snapshot, threshold alerts, and UI widgets (radar charts and history trendlines) on the frontend.

## Technical Context

**Language/Version**: Java 21 (Backend), TypeScript 5.x / React 19 (Frontend)

**Primary Dependencies**: 
- Spring Boot Starter Web, JPA, Security
- Recharts (for radar and line charts in the frontend)
- React Router v7

**Storage**: PostgreSQL 15 (primary database for configurations, daily snapshots, and current metric stats)

**Testing**: JUnit 5 + Mockito (Backend unit and integration tests), Vitest (Frontend unit tests)

**Target Platform**: Linux Server / JVM (JVM 21)

**Project Type**: modular web-service with React SPA frontend

**Performance Goals**: Health calculations completed in < 100ms on the backend; dashboard details rendered in < 500ms on the frontend.

**Constraints**: Health scores must decay by 5 points/day if no activity occurs for >72 hours (excluding weekends), capped at a max deduction of 30 points. Global weights must sum up to exactly 1.0. Snapshots track `healthDelta`. Current metrics persist list of `contributingFactors`. Real-time updates triggered on task, dependency, sprint, and critical path changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Modular Monolith Pattern**: Checked. The health engine will be housed in its own package boundary `com.deliveryflow.health` (with its entity, repository, service, controller, and DTO packages). Cross-module calls (e.g. to `TaskService`, `ProjectService`, `DependencyService`) will be handled through service interfaces, not direct repository calls.
- **Security-First**: Checked. All new health and configuration endpoints will be secured under `/api/v1/health` and `/api/v1/projects/{projectId}/health`, with custom RBAC permissions (`hasAnyRole('ADMIN', 'PMO', 'MANAGER')` for edits/configs).
- **Flyway Migrations**: Checked. New tables for `project_health_configs`, `project_health_metrics`, and `health_history_snapshots` will be created using a Flyway migration script (`V8__project_health_engine.sql`).
- **Standardized API Responses**: Checked. All responses will be mapped to clean DTOs and handle exceptions via the global controller advice.

## Project Structure

### Documentation (this feature)

```text
specs/002-project-health-engine/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Technology decisions & analysis (Phase 0)
├── data-model.md        # Database entities & relationships (Phase 1)
├── quickstart.md        # Validation & verification guide (Phase 1)
└── contracts/           # API schemas & documentation
    └── health-api.json  # OpenAPI JSON specification for health endpoints
```

### Source Code (repository root)

```text
deliveryflow-backend/src/main/
├── java/com/deliveryflow/
│   ├── health/
│   │   ├── controller/
│   │   │   ├── ProjectHealthController.java
│   │   │   └── HealthConfigController.java
│   │   ├── service/
│   │   │   ├── HealthCalculationService.java
│   │   │   ├── HealthSnapshotScheduler.java
│   │   │   └── HealthConfigService.java
│   │   ├── repository/
│   │   │   ├── ProjectHealthMetricRepository.java
│   │   │   ├── ProjectHealthConfigRepository.java
│   │   │   └── HealthHistorySnapshotRepository.java
│   │   ├── entity/
│   │   │   ├── ProjectHealthMetric.java
│   │   │   ├── ProjectHealthConfig.java
│   │   │   └── HealthHistorySnapshot.java
│   │   ├── dto/
│   │   │   ├── ProjectHealthResponse.java
│   │   │   ├── UpdateHealthConfigReq.java
│   │   │   └── HealthHistoryResponse.java
│   │   └── mapper/
│   │       └── HealthMapper.java
└── resources/
    └── db/migration/
        └── V8__project_health_engine.sql

deliveryflow-web/src/
├── features/health/
│   ├── components/
│   │   ├── ProjectHealthDashboard.tsx
│   │   ├── HealthRadarChart.tsx
│   │   ├── HealthHistoryTrendline.tsx
│   │   └── HealthConfigPanel.tsx
│   ├── api/
│   │   └── health.ts
│   └── types/
│       └── index.ts
```

**Structure Decision**: The backend changes will reside in a new self-contained package `com.deliveryflow.health` following the modular monolith pattern. The frontend changes will reside in `features/health` following our feature-module architecture.
