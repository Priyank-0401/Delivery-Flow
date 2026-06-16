# DeliveryFlow Constitution

## Core Principles

### I. Modular Monolith Architecture
DeliveryFlow follows a modular monolith pattern with clear package boundaries. Each domain module (auth, project, task, sprint, team, analytics, graph, health, ai) is self-contained with its own entity, repository, service, controller, and DTO layers. Cross-module communication happens through service interfaces, never direct repository access. This enables future microservice extraction without refactoring.

### II. Security-First Development
Every API endpoint MUST be secured by default. JWT-based authentication with Spring Security filter chains is mandatory. Role-Based Access Control (RBAC) with roles ADMIN, PMO, MANAGER, MEMBER enforces authorization. All endpoints require Bearer token authentication except explicitly whitelisted public endpoints (/api/v1/auth/login, /api/v1/auth/register, /health). CORS must use explicit origin allowlists, never wildcards.

### III. Test-Driven Quality
Testing is mandatory for all business logic and API endpoints. Unit tests (JUnit 5 + Mockito) cover service logic. Integration tests (Testcontainers) cover API contracts and database interactions. Target: >80% line coverage on business logic packages. Tests MUST pass before any merge to main.

### IV. API Design Standards
All APIs follow RESTful conventions with versioned paths (/api/v1/). Request/response DTOs are strictly separated from entities. All inputs are validated with Bean Validation (@Valid, @NotBlank, etc.). All responses use standardized error format: { "status", "message", "timestamp", "errors" }. Pagination follows cursor-based or offset patterns consistently.

### V. Database Integrity
PostgreSQL is the primary relational store. All schema changes go through Flyway migrations (never ddl-auto). Every table includes: id (UUID), created_at, updated_at. Soft deletes (deleted_at) are used universally. Audit columns (created_by, updated_by) are present on all mutable tables. Optimistic locking (@Version) is used for concurrent writes.

### VI. Observability & Logging
Structured JSON logging via SLF4J/Logback. Every request gets a correlation ID (X-Request-Id header). Spring Actuator exposes health, readiness, and liveness endpoints. All security events (login, logout, access denied, token refresh) are logged to the audit trail.

### VII. Clean Code Standards
Lombok is used for boilerplate reduction but not for critical logic. DTOs use record types where possible. Services follow single-responsibility principle. Controllers contain zero business logic — they delegate entirely to services. Package structure: {module}/controller, {module}/service, {module}/repository, {module}/entity, {module}/dto, {module}/mapper.

## Technology Stack

- **Backend**: Java 21, Spring Boot 3.3, Spring Security 6, Spring Data JPA
- **Database**: PostgreSQL 15 (primary), Neo4j 5 (graph engine), Redis (caching/sessions)
- **Build**: Gradle 8.8
- **Frontend**: React 19, TypeScript, Vite 8, TailwindCSS 3, TanStack Query
- **Testing**: JUnit 5, Mockito, Testcontainers, Spring Boot Test
- **API Docs**: SpringDoc OpenAPI 3 (Swagger UI)
- **Migrations**: Flyway

## Security Standards

- JWT access tokens expire after 60 minutes
- Refresh tokens stored in HTTP-only, Secure, SameSite cookies
- Password hashing: BCrypt with strength 12
- All API responses exclude stack traces in production
- Rate limiting on auth endpoints (max 5 attempts per minute)
- OWASP Top 10 mitigations enforced

## Development Workflow

1. Feature branches from main
2. Spec-driven development via GitHub Spec (Specify)
3. All changes require passing CI (build + test + lint)
4. Code follows the established package conventions
5. Database changes require Flyway migration scripts
6. API changes require OpenAPI documentation updates

## Governance

This constitution supersedes all ad-hoc decisions. Amendments require documentation and rationale. All code reviews must verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-06-16 | **Last Amended**: 2026-06-16
